package services

import (
	"errors"
	"mutasi-data-backend/models"
	"mutasi-data-backend/repositories"
	"time"

	"gorm.io/gorm"
)

type PeriodeService interface {
	GetAll(perusahaanID uint) ([]models.PeriodePelaporan, error)
	GetByID(id uint) (*models.PeriodePelaporan, error)
	Create(periode *models.PeriodePelaporan) error
	Update(id uint, periode *models.PeriodePelaporan) error
	Delete(id uint) error
	Finalize(id uint) error
}

type periodeService struct {
	repo repositories.PeriodeRepository
}

func NewPeriodeService(repo repositories.PeriodeRepository) PeriodeService {
	return &periodeService{repo: repo}
}

func (s *periodeService) GetAll(perusahaanID uint) ([]models.PeriodePelaporan, error) {
	return s.repo.GetAll(perusahaanID)
}

func (s *periodeService) GetByID(id uint) (*models.PeriodePelaporan, error) {
	periode, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("periode not found")
		}
		return nil, err
	}
	return periode, nil
}

func (s *periodeService) Create(periode *models.PeriodePelaporan) error {
	// Validasi required fields
	if periode.PerusahaanID == 0 {
		return errors.New("perusahaan_id is required")
	}
	if periode.BulanIuran == "" {
		return errors.New("bulan_iuran is required")
	}

	// Cek duplicate periode
	isDuplicate, err := s.repo.CheckDuplicate(periode.PerusahaanID, periode.BulanIuran)
	if err != nil {
		return err
	}
	if isDuplicate {
		return errors.New("periode dengan bulan iuran yang sama sudah ada untuk perusahaan ini")
	}

	// Set default status
	if periode.Status == "" {
		periode.Status = "draft"
	}

	return s.repo.Create(periode)
}

func (s *periodeService) Update(id uint, periode *models.PeriodePelaporan) error {
	// Cek apakah periode exists
	existing, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("periode not found")
		}
		return err
	}

	// Validasi: tidak bisa update jika sudah finalized
	if existing.Status == "finalized" {
		return errors.New("cannot update finalized periode")
	}

	// Update fields
	existing.BulanIuran = periode.BulanIuran
	existing.Keterangan = periode.Keterangan

	return s.repo.Update(existing)
}

func (s *periodeService) Delete(id uint) error {
	// Cek apakah exists
	existing, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("periode not found")
		}
		return err
	}

	// Validasi: tidak bisa hapus jika sudah finalized
	if existing.Status == "finalized" {
		return errors.New("cannot delete finalized periode")
	}

	return s.repo.Delete(id)
}

func (s *periodeService) Finalize(id uint) error {
	// Cek apakah exists
	existing, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("periode not found")
		}
		return err
	}

	// Validasi: tidak bisa finalize jika sudah finalized
	if existing.Status == "finalized" {
		return errors.New("periode already finalized")
	}

	// Update last_calculated_at saat finalisasi
	existing.LastCalculatedAt = new(time.Time)
	*existing.LastCalculatedAt = time.Now()

	return s.repo.Finalize(id)
}