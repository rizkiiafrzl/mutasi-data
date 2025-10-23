package main

import (
	"log"
	"mutasi-data-backend/config"
	"mutasi-data-backend/database"
	"mutasi-data-backend/handlers"
	"mutasi-data-backend/models"
	"mutasi-data-backend/repositories"
	"mutasi-data-backend/services"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found")
	}

	cfg := config.LoadConfig()
	log.Println("✅ Configuration loaded")

	log.Println("🔌 Connecting to database...")
	if err := database.ConnectDB(cfg); err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	log.Println("📦 Running database migrations...")
	if err := database.DB.AutoMigrate(
		&models.User{},
		&models.Perusahaan{},
		&models.PeriodePelaporan{},
		&models.TenagaKerja{},
		&models.PeriodeTK{},
		&models.UploadHistory{},
	); err != nil {
		log.Fatal("❌ Failed to migrate database:", err)
	}
	log.Println("✅ Database migration completed")

	// Initialize repositories
	perusahaanRepo := repositories.NewPerusahaanRepository(database.DB)

	// Initialize services
	perusahaanService := services.NewPerusahaanService(perusahaanRepo)

	// Initialize handlers
	perusahaanHandler := handlers.NewPerusahaanHandler(perusahaanService)

	app := fiber.New(fiber.Config{
		AppName: "Mutasi Data API v1.0",
	})

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Mutasi Data API is running",
			"version": "1.0.0",
		})
	})

	api := app.Group("/api")

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "API is healthy",
		})
	})

	// Perusahaan routes
	perusahaanRoutes := api.Group("/perusahaan")
	perusahaanRoutes.Get("/", perusahaanHandler.GetAll)
	perusahaanRoutes.Get("/:id", perusahaanHandler.GetByID)
	perusahaanRoutes.Post("/", perusahaanHandler.Create)
	perusahaanRoutes.Put("/:id", perusahaanHandler.Update)
	perusahaanRoutes.Delete("/:id", perusahaanHandler.Delete)

	port := cfg.Port
	log.Printf("🚀 Server starting on http://localhost:%s", port)
	log.Println("📋 Available endpoints:")
	log.Println("   GET    /api/perusahaan")
	log.Println("   GET    /api/perusahaan/:id")
	log.Println("   POST   /api/perusahaan")
	log.Println("   PUT    /api/perusahaan/:id")
	log.Println("   DELETE /api/perusahaan/:id")

	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}