package core

import "time"

type RevenueAnalytic struct {
	From                  time.Time `gorm:"primaryKey"`
	To                    time.Time `gorm:"primaryKey"`
	TotalRevenue          float64
	CompletedTransactions int64
	FailedTransactions    int64
}
