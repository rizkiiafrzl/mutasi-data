package handlers

import (
	"mutasi-data-backend/models"
	"mutasi-data-backend/services"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type PeriodeHandler struct {
	service services.PeriodeService
}

func NewPeriodeHandler(service services.PeriodeService) *PeriodeHandler {
	return &PeriodeHandler{service: service}
}

// GET /api/periode?perusahaan_id=1
func (h *PeriodeHandler) GetAll(c *fiber.Ctx) error {
	perusahaanID, _ := strconv.ParseUint(c.Query("perusahaan_id", "0"), 10, 32)

	periode, err := h.service.GetAll(uint(perusahaanID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get periode",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Periode retrieved successfully",
		"data":    periode,
	})
}

// GET /api/periode/:id
func (h *PeriodeHandler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid ID",
			"error":   err.Error(),
		})
	}

	periode, err := h.service.GetByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Periode retrieved successfully",
		"data":    periode,
	})
}

// POST /api/periode
func (h *PeriodeHandler) Create(c *fiber.Ctx) error {
	var periode models.PeriodePelaporan

	if err := c.BodyParser(&periode); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.service.Create(&periode); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create periode",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Periode created successfully",
		"data":    periode,
	})
}

// PUT /api/periode/:id
func (h *PeriodeHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid ID",
			"error":   err.Error(),
		})
	}

	var periode models.PeriodePelaporan
	if err := c.BodyParser(&periode); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.service.Update(uint(id), &periode); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update periode",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Periode updated successfully",
		"data":    periode,
	})
}

// DELETE /api/periode/:id
func (h *PeriodeHandler) Delete(c *fiber.Ctx) error {
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
			"message": "Failed to delete periode",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Periode deleted successfully",
	})
}

// PUT /api/periode/:id/finalize
func (h *PeriodeHandler) Finalize(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid ID",
			"error":   err.Error(),
		})
	}

	if err := h.service.Finalize(uint(id)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Failed to finalize periode",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Periode finalized successfully",
	})
}