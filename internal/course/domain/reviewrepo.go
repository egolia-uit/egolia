package domain

type ReviewRepo interface {
	Save(review *Review) error
}
