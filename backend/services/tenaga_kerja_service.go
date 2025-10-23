package services

import (
	"errors"
	"mutasi-data-backend/models"
	"mutasi-data-backend/repositories"
	"regexp"

	"gorm.io/gorm"
)

type TenagaKerjaService interface {
	GetAll(perusahaanID uint, periodeID uint, status string, search string, page int, limit int) ([]models.TenagaKerja, int64, error)
	GetByID(id uint) (*models.TenagaKerja, error)
	Create(tk *models.TenagaKerja) error
	Update(id uint, tk *models.TenagaKerja) error
	Delete(id uint) error
}

type tenagaKerjaService struct {
	repo repositories.TenagaKerjaRepository
}

func NewTenagaKerjaService(repo repositories.TenagaKerjaRepository) TenagaKerjaService {
	return &tenagaKerjaService{repo: repo}
}

func (s *tenagaKerjaService) GetAll(perusahaanID uint, periodeID uint, status string, search string, page int, limit int) ([]models.TenagaKerja, int64, error) {
	// Default pagination
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	return s.repo.GetAll(perusahaanID, periodeID, status, search, page, limit)
}

func (s *tenagaKerjaService) GetByID(id uint) (*models.TenagaKerja, error) {
	tk, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("tenaga kerja not found")
		}
		return nil, err
	}
	return tk, nil
}

func (s *tenagaKerjaService) Create(tk *models.TenagaKerja) error {
	// Validasi required fields
	if tk.PerusahaanID == 0 {
		return errors.New("perusahaan_id is required")
	}
	if tk.NoKPJ == "" {
		return errors.New("no_kpj is required")
	}
	if tk.NIK == "" {
		return errors.New("nik is required")
	}
	if tk.NamaLengkap == "" {
		return errors.New("nama_lengkap is required")
	}

	// Validasi NIK (harus 16 digit)
	if !isValidNIK(tk.NIK) {
		return errors.New("nik harus 16 digit angka")
	}

	// Cek NIK sudah ada atau belum
	exists, err := s.repo.CheckNIKExists(tk.PerusahaanID, tk.NIK, 0)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("nik sudah terdaftar untuk perusahaan ini")
	}

	return s.repo.Create(tk)
}

func (s *tenagaKerjaService) Update(id uint, tk *models.TenagaKerja) error {
	// Cek apakah TK exists
	existing, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("tenaga kerja not found")
		}
		return err
	}

	// Validasi NIK jika diubah
	if tk.NIK != "" && tk.NIK != existing.NIK {
		if !isValidNIK(tk.NIK) {
			return errors.New("nik harus 16 digit angka")
		}

		// Cek NIK baru sudah ada atau belum
		exists, err := s.repo.CheckNIKExists(existing.PerusahaanID, tk.NIK, id)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("nik sudah terdaftar untuk perusahaan ini")
		}
	}

	// Update fields yang boleh diubah (KPJ dan NIK tidak boleh diubah)
	// existing.NoKPJ = tk.NoKPJ // KPJ tidak boleh diubah
	// existing.NIK = tk.NIK     // NIK tidak boleh diubah
	existing.NamaLengkap = tk.NamaLengkap
	existing.TanggalLahir = tk.TanggalLahir
	existing.StatusKewarganegaraan = tk.StatusKewarganegaraan
	existing.StatusPegawai = tk.StatusPegawai
	existing.TanggalAwalBekerja = tk.TanggalAwalBekerja
	existing.TanggalAkhirKontrak = tk.TanggalAkhirKontrak

	return s.repo.Update(existing)
}

func (s *tenagaKerjaService) Delete(id uint) error {
	// Cek apakah exists
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("tenaga kerja not found")
		}
		return err
	}

	return s.repo.Delete(id)
}

// Helper function untuk validasi NIK
func isValidNIK(nik string) bool {
	// NIK harus 16 digit angka
	match, _ := regexp.MatchString(`^\d{16}$`, nik)
	return match
}