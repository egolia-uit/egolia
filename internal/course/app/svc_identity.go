package app

import "context"

// Is this being used anywhere?
// If not, delete it, and may rerun generate mockery
type IdentitySvc interface {
	GetUsersByIDs(ctx context.Context, ids []string) ([]*User, error)
}
