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
	UpdateStatus(id uint, status string) error // TAMBAH INI
}

type tenagaKerjaService struct {
	repo repositories.TenagaKerjaRepository
}

func NewTenagaKerjaService(repo repositories.TenagaKerjaRepository) TenagaKerjaService {
	return &tenagaKerjaService{repo: repo}
}

func (s *tenagaKerjaService) GetAll(perusahaanID uint, periodeID uint, status string, search string, page int, limit int) ([]models.TenagaKerja, int64, error) {
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

	if !isValidNIK(tk.NIK) {
		return errors.New("nik harus 16 digit angka")
	}

	exists, err := s.repo.CheckNIKExists(tk.PerusahaanID, tk.NIK, 0)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("nik sudah terdaftar untuk perusahaan ini")
	}

	// Set default status jika kosong
	if tk.StatusKepesertaan == "" {
		tk.StatusKepesertaan = "Aktif"
	}

	return s.repo.Create(tk)
}

func (s *tenagaKerjaService) Update(id uint, tk *models.TenagaKerja) error {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("tenaga kerja not found")
		}
		return err
	}

	if tk.NIK != "" && tk.NIK != existing.NIK {
		if !isValidNIK(tk.NIK) {
			return errors.New("nik harus 16 digit angka")
		}

		exists, err := s.repo.CheckNIKExists(existing.PerusahaanID, tk.NIK, id)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("nik sudah terdaftar untuk perusahaan ini")
		}
	}

	existing.NamaLengkap = tk.NamaLengkap
	existing.TanggalLahir = tk.TanggalLahir
	existing.StatusKewarganegaraan = tk.StatusKewarganegaraan
	existing.StatusPegawai = tk.StatusPegawai
	existing.TanggalAwalBekerja = tk.TanggalAwalBekerja
	existing.TanggalAkhirKontrak = tk.TanggalAkhirKontrak

	return s.repo.Update(existing)
}

func (s *tenagaKerjaService) Delete(id uint) error {
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("tenaga kerja not found")
		}
		return err
	}

	return s.repo.Delete(id)
}

// TAMBAH METHOD INI
func (s *tenagaKerjaService) UpdateStatus(id uint, status string) error {
	// Cek TK exists
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("tenaga kerja not found")
		}
		return err
	}

	// Validasi status
	if status != "Aktif" && status != "Nonaktif" {
		return errors.New("status harus 'Aktif' atau 'Nonaktif'")
	}

	return s.repo.UpdateStatus(id, status)
}

func isValidNIK(nik string) bool {
	match, _ := regexp.MatchString(`^\d{16}$`, nik)
	return match
}