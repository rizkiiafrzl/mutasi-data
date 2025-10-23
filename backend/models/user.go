package models

import (
	"time"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	PerusahaanID uint      `gorm:"not null" json:"perusahaan_id"`
	Username     string    `gorm:"type:varchar(100);not null" json:"username"`
	Email        string    `gorm:"type:varchar(100);not null" json:"email"`
	Password     string    `gorm:"type:varchar(255);not null" json:"-"`
	NamaUser     string    `gorm:"type:varchar(100)" json:"nama_user"`
	Role         string    `gorm:"type:varchar(50)" json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Perusahaan Perusahaan `gorm:"foreignKey:PerusahaanID" json:"perusahaan,omitempty"`
}

func (User) TableName() string {
	return "users"
}