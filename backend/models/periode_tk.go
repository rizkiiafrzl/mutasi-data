package models

import (
	"time"
)

type PeriodeTK struct {
	ID                     uint       `gorm:"primaryKey" json:"id"`
	PeriodeID              uint       `gorm:"not null" json:"periode_id"`
	TKID                   uint       `gorm:"not null" json:"tk_id"`
	UpahPokok              float64    `gorm:"type:decimal(15,2)" json:"upah_pokok"`
	Tunjangan              float64    `gorm:"type:decimal(15,2)" json:"tunjangan"`
	TotalUpah              float64    `gorm:"type:decimal(15,2)" json:"total_upah"`
	StatusKeaktifan        string     `gorm:"type:varchar(50)" json:"status_keaktifan"`
	IuranJHT               float64    `gorm:"type:decimal(15,2)" json:"iuran_jht"`
	IuranJP                float64    `gorm:"type:decimal(15,2)" json:"iuran_jp"`
	IuranJKK               float64    `gorm:"type:decimal(15,2)" json:"iuran_jkk"`
	IuranJKM               float64    `gorm:"type:decimal(15,2)" json:"iuran_jkm"`
	IuranJKP               float64    `gorm:"type:decimal(15,2)" json:"iuran_jkp"`
	TanggalEfektifNonaktif *time.Time `json:"tanggal_efektif_nonaktif"`
	AlasanNonaktif         string     `gorm:"type:varchar(255)" json:"alasan_nonaktif"`
	CreatedAt              time.Time  `json:"created_at"`
	UpdatedAt              time.Time  `json:"updated_at"`

	Periode     PeriodePelaporan `gorm:"foreignKey:PeriodeID" json:"periode,omitempty"`
	TenagaKerja TenagaKerja      `gorm:"foreignKey:TKID" json:"tenaga_kerja,omitempty"`
}

func (PeriodeTK) TableName() string {
	return "periode_tk"
}