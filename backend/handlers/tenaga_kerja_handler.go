package handlers

import (
	"mutasi-data-backend/models"
	"mutasi-data-backend/services"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type TenagaKerjaHandler struct {
	service services.TenagaKerjaService
}

func NewTenagaKerjaHandler(service services.TenagaKerjaService) *TenagaKerjaHandler {
	return &TenagaKerjaHandler{service: service}
}

// GET /api/tenaga-kerja?perusahaan_id=1&periode_id=1&status=aktif&search=budi&page=1&limit=10
func (h *TenagaKerjaHandler) GetAll(c *fiber.Ctx) error {
	perusahaanID, _ := strconv.ParseUint(c.Query("perusahaan_id", "0"), 10, 32)
	periodeID, _ := strconv.ParseUint(c.Query("periode_id", "0"), 10, 32)
	status := c.Query("status", "")
	search := c.Query("search", "")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	tk, total, err := h.service.GetAll(uint(perusahaanID), uint(periodeID), status, search, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get tenaga kerja",
			"error":   err.Error(),
		})
	}

	// Calculate pagination metadata
	totalPages := (int(total) + limit - 1) / limit

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tenaga kerja retrieved successfully",
		"data":    tk,
		"pagination": fiber.Map{
			"total":        total,
			"page":         page,
			"limit":        limit,
			"total_pages":  totalPages,
		},
	})
}

// GET /api/tenaga-kerja/:id
func (h *TenagaKerjaHandler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid ID",
			"error":   err.Error(),
		})
	}

	tk, err := h.service.GetByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tenaga kerja retrieved successfully",
		"data":    tk,
	})
}

// POST /api/tenaga-kerja
func (h *TenagaKerjaHandler) Create(c *fiber.Ctx) error {
	var tk models.TenagaKerja

	if err := c.BodyParser(&tk); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.service.Create(&tk); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create tenaga kerja",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Tenaga kerja created successfully",
		"data":    tk,
	})
}

// PUT /api/tenaga-kerja/:id
func (h *TenagaKerjaHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid ID",
			"error":   err.Error(),
		})
	}

	var tk models.TenagaKerja
	if err := c.BodyParser(&tk); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.service.Update(uint(id), &tk); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update tenaga kerja",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tenaga kerja updated successfully",
		"data":    tk,
	})
}

// DELETE /api/tenaga-kerja/:id
func (h *TenagaKerjaHandler) Delete(c *fiber.Ctx) error {
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
			"message": "Failed to delete tenaga kerja",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tenaga kerja deleted successfully",
	})
}

// PUT /api/tenaga-kerja/:id/status
func (h *TenagaKerjaHandler) UpdateStatus(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid ID",
			"error":   err.Error(),
		})
	}

	var req struct {
		Status string `json:"status"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.service.UpdateStatus(uint(id), req.Status); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update status",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Status updated successfully",
	})
}