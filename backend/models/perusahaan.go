package models

import (
	"time"
)

type Perusahaan struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	NamaPerusahaan string    `gorm:"type:varchar(255);not null" json:"nama_perusahaan"`
	NoPeserta      string    `gorm:"type:varchar(100);not null" json:"no_peserta"`
	Alamat         string    `gorm:"type:text" json:"alamat"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (Perusahaan) TableName() string {
	return "perusahaan"
}