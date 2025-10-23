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
	periodeRepo := repositories.NewPeriodeRepository(database.DB)
	tenagaKerjaRepo := repositories.NewTenagaKerjaRepository(database.DB)

	// Initialize services
	perusahaanService := services.NewPerusahaanService(perusahaanRepo)
	periodeService := services.NewPeriodeService(periodeRepo)
	tenagaKerjaService := services.NewTenagaKerjaService(tenagaKerjaRepo)

	// Initialize handlers
	perusahaanHandler := handlers.NewPerusahaanHandler(perusahaanService)
	periodeHandler := handlers.NewPeriodeHandler(periodeService)
	tenagaKerjaHandler := handlers.NewTenagaKerjaHandler(tenagaKerjaService)

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

	// Periode routes
	periodeRoutes := api.Group("/periode")
	periodeRoutes.Get("/", periodeHandler.GetAll)
	periodeRoutes.Get("/:id", periodeHandler.GetByID)
	periodeRoutes.Post("/", periodeHandler.Create)
	periodeRoutes.Put("/:id", periodeHandler.Update)
	periodeRoutes.Delete("/:id", periodeHandler.Delete)
	periodeRoutes.Put("/:id/finalize", periodeHandler.Finalize)

	// Tenaga Kerja routes
	tkRoutes := api.Group("/tenaga-kerja")
	tkRoutes.Get("/", tenagaKerjaHandler.GetAll)
	tkRoutes.Get("/:id", tenagaKerjaHandler.GetByID)
	tkRoutes.Post("/", tenagaKerjaHandler.Create)
	tkRoutes.Put("/:id", tenagaKerjaHandler.Update)
	tkRoutes.Delete("/:id", tenagaKerjaHandler.Delete)

	port := cfg.Port
	log.Printf("🚀 Server starting on http://localhost:%s", port)
	log.Println("📋 Available endpoints:")
	log.Println("   Perusahaan: GET, POST, PUT, DELETE /api/perusahaan")
	log.Println("   Periode: GET, POST, PUT, DELETE /api/periode")
	log.Println("   Tenaga Kerja: GET, POST, PUT, DELETE /api/tenaga-kerja")

	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}