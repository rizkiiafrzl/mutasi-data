package models

import (
	"time"
)

type PeriodePelaporan struct {
	ID               uint       `gorm:"primaryKey" json:"id"`
	PerusahaanID     uint       `gorm:"not null" json:"perusahaan_id"`
	BulanIuran       string     `gorm:"type:varchar(50);not null" json:"bulan_iuran"`
	Status           string     `gorm:"type:varchar(50);default:'draft'" json:"status"`
	Keterangan       string     `gorm:"type:text" json:"keterangan"`
	LastCalculatedAt *time.Time `json:"last_calculated_at"`
	FinalizedAt      *time.Time `json:"finalized_at"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`

	Perusahaan Perusahaan `gorm:"foreignKey:PerusahaanID" json:"perusahaan,omitempty"`
}

func (PeriodePelaporan) TableName() string {
	return "periode_pelaporan"
}