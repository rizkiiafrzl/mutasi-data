package main

import (
	"log"
	"mutasi-data-backend/config"
	"mutasi-data-backend/database"
	"mutasi-data-backend/models"

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
		})
	})

	api := app.Group("/api")
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "API is healthy",
		})
	})

	port := cfg.Port
	log.Printf("🚀 Server starting on http://localhost:%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}