package services

import (
	"errors"
	"mutasi-data-backend/models"
	"mutasi-data-backend/repositories"

	"gorm.io/gorm"
)

type PerusahaanService interface {
	GetAll() ([]models.Perusahaan, error)
	GetByID(id uint) (*models.Perusahaan, error)
	Create(perusahaan *models.Perusahaan) error
	Update(id uint, perusahaan *models.Perusahaan) error
	Delete(id uint) error
}

type perusahaanService struct {
	repo repositories.PerusahaanRepository
}

func NewPerusahaanService(repo repositories.PerusahaanRepository) PerusahaanService {
	return &perusahaanService{repo: repo}
}

func (s *perusahaanService) GetAll() ([]models.Perusahaan, error) {
	return s.repo.GetAll()
}

func (s *perusahaanService) GetByID(id uint) (*models.Perusahaan, error) {
	perusahaan, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("perusahaan not found")
		}
		return nil, err
	}
	return perusahaan, nil
}

func (s *perusahaanService) Create(perusahaan *models.Perusahaan) error {
	// Validasi: No Peserta harus unique (bisa ditambahkan)
	if perusahaan.NamaPerusahaan == "" {
		return errors.New("nama perusahaan is required")
	}
	if perusahaan.NoPeserta == "" {
		return errors.New("no peserta is required")
	}
	return s.repo.Create(perusahaan)
}

func (s *perusahaanService) Update(id uint, perusahaan *models.Perusahaan) error {
	// Cek apakah perusahaan exists
	existing, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("perusahaan not found")
		}
		return err
	}

	// Update fields
	existing.NamaPerusahaan = perusahaan.NamaPerusahaan
	existing.NoPeserta = perusahaan.NoPeserta
	existing.Alamat = perusahaan.Alamat

	return s.repo.Update(existing)
}

func (s *perusahaanService) Delete(id uint) error {
	// Cek apakah exists
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("perusahaan not found")
		}
		return err
	}
	return s.repo.Delete(id)
}