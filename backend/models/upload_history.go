package models

import (
	"time"
)

type UploadHistory struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	UserID           uint      `gorm:"not null" json:"user_id"`
	PeriodeID        uint      `gorm:"not null" json:"periode_id"`
	JenisUpload      string    `gorm:"type:varchar(100)" json:"jenis_upload"`
	OriginalFilename string    `gorm:"type:varchar(255)" json:"original_filename"`
	Status           string    `gorm:"type:varchar(50)" json:"status"`
	TotalRows        int       `json:"total_rows"`
	ValidRows        int       `json:"valid_rows"`
	InvalidRows      int       `json:"invalid_rows"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`

	User    User             `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Periode PeriodePelaporan `gorm:"foreignKey:PeriodeID" json:"periode,omitempty"`
}

func (UploadHistory) TableName() string {
	return "upload_history"
}