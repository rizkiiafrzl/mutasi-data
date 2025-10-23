package models

import (
	"time"
)

type TenagaKerja struct {
	ID                    uint       `gorm:"primaryKey" json:"id"`
	PerusahaanID          uint       `gorm:"not null" json:"perusahaan_id"`
	NoKPJ                 string     `gorm:"type:varchar(50);not null" json:"no_kpj"`
	NIK                   string     `gorm:"type:varchar(16);not null" json:"nik"`
	NamaLengkap           string     `gorm:"type:varchar(255);not null" json:"nama_lengkap"`
	TanggalLahir          time.Time  `json:"tanggal_lahir"`
	StatusKewarganegaraan string     `gorm:"type:varchar(50)" json:"status_kewarganegaraan"`
	StatusPegawai         string     `gorm:"type:varchar(50)" json:"status_pegawai"`
	TanggalAwalBekerja    time.Time  `json:"tanggal_awal_bekerja"`
	TanggalAkhirKontrak   *time.Time `json:"tanggal_akhir_kontrak"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`

	Perusahaan Perusahaan `gorm:"foreignKey:PerusahaanID" json:"perusahaan,omitempty"`
}

func (TenagaKerja) TableName() string {
	return "tenaga_kerja"
}