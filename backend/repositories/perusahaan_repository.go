package repositories

import (
	"mutasi-data-backend/models"

	"gorm.io/gorm"
)

type PerusahaanRepository interface {
	GetAll() ([]models.Perusahaan, error)
	GetByID(id uint) (*models.Perusahaan, error)
	Create(perusahaan *models.Perusahaan) error
	Update(perusahaan *models.Perusahaan) error
	Delete(id uint) error
}

type perusahaanRepository struct {
	db *gorm.DB
}

func NewPerusahaanRepository(db *gorm.DB) PerusahaanRepository {
	return &perusahaanRepository{db: db}
}

func (r *perusahaanRepository) GetAll() ([]models.Perusahaan, error) {
	var perusahaan []models.Perusahaan
	err := r.db.Find(&perusahaan).Error
	return perusahaan, err
}

func (r *perusahaanRepository) GetByID(id uint) (*models.Perusahaan, error) {
	var perusahaan models.Perusahaan
	err := r.db.First(&perusahaan, id).Error
	if err != nil {
		return nil, err
	}
	return &perusahaan, nil
}

func (r *perusahaanRepository) Create(perusahaan *models.Perusahaan) error {
	return r.db.Create(perusahaan).Error
}

func (r *perusahaanRepository) Update(perusahaan *models.Perusahaan) error {
	return r.db.Save(perusahaan).Error
}

func (r *perusahaanRepository) Delete(id uint) error {
	return r.db.Delete(&models.Perusahaan{}, id).Error
}