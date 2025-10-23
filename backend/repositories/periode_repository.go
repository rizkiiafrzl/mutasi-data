package repositories

import (
	"mutasi-data-backend/models"

	"gorm.io/gorm"
)

type PeriodeRepository interface {
	GetAll(perusahaanID uint) ([]models.PeriodePelaporan, error)
	GetByID(id uint) (*models.PeriodePelaporan, error)
	Create(periode *models.PeriodePelaporan) error
	Update(periode *models.PeriodePelaporan) error
	Delete(id uint) error
	CheckDuplicate(perusahaanID uint, bulanIuran string) (bool, error)
	Finalize(id uint) error
}

type periodeRepository struct {
	db *gorm.DB
}

func NewPeriodeRepository(db *gorm.DB) PeriodeRepository {
	return &periodeRepository{db: db}
}

func (r *periodeRepository) GetAll(perusahaanID uint) ([]models.PeriodePelaporan, error) {
	var periode []models.PeriodePelaporan
	query := r.db.Preload("Perusahaan")
	
	if perusahaanID > 0 {
		query = query.Where("perusahaan_id = ?", perusahaanID)
	}
	
	err := query.Order("created_at DESC").Find(&periode).Error
	return periode, err
}

func (r *periodeRepository) GetByID(id uint) (*models.PeriodePelaporan, error) {
	var periode models.PeriodePelaporan
	err := r.db.Preload("Perusahaan").First(&periode, id).Error
	if err != nil {
		return nil, err
	}
	return &periode, nil
}

func (r *periodeRepository) Create(periode *models.PeriodePelaporan) error {
	return r.db.Create(periode).Error
}

func (r *periodeRepository) Update(periode *models.PeriodePelaporan) error {
	return r.db.Save(periode).Error
}

func (r *periodeRepository) Delete(id uint) error {
	return r.db.Delete(&models.PeriodePelaporan{}, id).Error
}

func (r *periodeRepository) CheckDuplicate(perusahaanID uint, bulanIuran string) (bool, error) {
	var count int64
	err := r.db.Model(&models.PeriodePelaporan{}).
		Where("perusahaan_id = ? AND bulan_iuran = ?", perusahaanID, bulanIuran).
		Count(&count).Error
	
	return count > 0, err
}

func (r *periodeRepository) Finalize(id uint) error {
	return r.db.Model(&models.PeriodePelaporan{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":       "finalized",
			"finalized_at": gorm.Expr("NOW()"),
		}).Error
}