package app

type User struct {
	ID     string
	Name   *string
	Groups []string
	Roles  []string
}
