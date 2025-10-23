package handlers

import (
	"mutasi-data-backend/models"
	"mutasi-data-backend/services"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type PerusahaanHandler struct {
	service services.PerusahaanService
}

func NewPerusahaanHandler(service services.PerusahaanService) *PerusahaanHandler {
	return &PerusahaanHandler{service: service}
}

// GET /api/perusahaan
func (h *PerusahaanHandler) GetAll(c *fiber.Ctx) error {
	perusahaan, err := h.service.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get perusahaan",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Perusahaan retrieved successfully",
		"data":    perusahaan,
	})
}

// GET /api/perusahaan/:id
func (h *PerusahaanHandler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid ID",
			"error":   err.Error(),
		})
	}

	perusahaan, err := h.service.GetByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Perusahaan retrieved successfully",
		"data":    perusahaan,
	})
}

// POST /api/perusahaan
func (h *PerusahaanHandler) Create(c *fiber.Ctx) error {
	var perusahaan models.Perusahaan

	if err := c.BodyParser(&perusahaan); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.service.Create(&perusahaan); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create perusahaan",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Perusahaan created successfully",
		"data":    perusahaan,
	})
}

// PUT /api/perusahaan/:id
func (h *PerusahaanHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid ID",
			"error":   err.Error(),
		})
	}

	var perusahaan models.Perusahaan
	if err := c.BodyParser(&perusahaan); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.service.Update(uint(id), &perusahaan); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update perusahaan",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Perusahaan updated successfully",
		"data":    perusahaan,
	})
}

// DELETE /api/perusahaan/:id
func (h *PerusahaanHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid ID",
			"error":   err.Error(),
		})
	}

	if err := h.service.Delete(uint(id)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete perusahaan",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Perusahaan deleted successfully",
	})
}