package repositories

import (
	"mutasi-data-backend/models"

	"gorm.io/gorm"
)

type TenagaKerjaRepository interface {
	GetAll(perusahaanID uint, periodeID uint, status string, search string, page int, limit int) ([]models.TenagaKerja, int64, error)
	GetByID(id uint) (*models.TenagaKerja, error)
	Create(tk *models.TenagaKerja) error
	Update(tk *models.TenagaKerja) error
	Delete(id uint) error
	CheckNIKExists(perusahaanID uint, nik string, excludeID uint) (bool, error)
}

type tenagaKerjaRepository struct {
	db *gorm.DB
}

func NewTenagaKerjaRepository(db *gorm.DB) TenagaKerjaRepository {
	return &tenagaKerjaRepository{db: db}
}

func (r *tenagaKerjaRepository) GetAll(perusahaanID uint, periodeID uint, status string, search string, page int, limit int) ([]models.TenagaKerja, int64, error) {
	var tk []models.TenagaKerja
	var total int64

	query := r.db.Model(&models.TenagaKerja{}).Preload("Perusahaan")

	// Filter by perusahaan
	if perusahaanID > 0 {
		query = query.Where("perusahaan_id = ?", perusahaanID)
	}

	// Search by nama, NIK, atau KPJ
	if search != "" {
		query = query.Where("nama_lengkap ILIKE ? OR nik ILIKE ? OR no_kpj ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Count total
	query.Count(&total)

	// Pagination
	offset := (page - 1) * limit
	err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&tk).Error

	return tk, total, err
}

func (r *tenagaKerjaRepository) GetByID(id uint) (*models.TenagaKerja, error) {
	var tk models.TenagaKerja
	err := r.db.Preload("Perusahaan").First(&tk, id).Error
	if err != nil {
		return nil, err
	}
	return &tk, nil
}

func (r *tenagaKerjaRepository) Create(tk *models.TenagaKerja) error {
	return r.db.Create(tk).Error
}

func (r *tenagaKerjaRepository) Update(tk *models.TenagaKerja) error {
	return r.db.Save(tk).Error
}

func (r *tenagaKerjaRepository) Delete(id uint) error {
	return r.db.Delete(&models.TenagaKerja{}, id).Error
}

func (r *tenagaKerjaRepository) CheckNIKExists(perusahaanID uint, nik string, excludeID uint) (bool, error) {
	var count int64
	query := r.db.Model(&models.TenagaKerja{}).
		Where("perusahaan_id = ? AND nik = ?", perusahaanID, nik)

	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}

	err := query.Count(&count).Error
	return count > 0, err
}