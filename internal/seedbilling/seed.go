package seedbilling

import (
	"context"
	"os"

	"gorm.io/gorm"
)

type Seed struct {
	db *gorm.DB
}

func NewSeed(db *gorm.DB) (*Seed, error) {
	return &Seed{db: db}, nil
}

func (s *Seed) Run(ctx context.Context) error {
	s.PrintSQL(os.Stdout)

	transactions := s.createTransactions()
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		tx.Save(transactions)
		return nil
	})
}
