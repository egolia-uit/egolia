package app_test

import (
	"context"
	"testing"

	"github.com/egolia-uit/egolia/internal/course/domain"
)

// mockUow is a test double for domain.UnitOfWork.
// It directly executes the callback with the contained RepoRegistry,
// so handler logic is tested without mocking infrastructure.
type mockUow struct {
	reg domain.RepoRegistry
}

func (m *mockUow) Execute(ctx context.Context, fn func(domain.RepoRegistry) error) error {
	return fn(m.reg)
}

// tSafeRepoRegistry wraps the auto-generated mock to provide safe defaults.
// It calls t.Cleanup to assert expectations at test end.
type tSafeRepoRegistry struct {
	*domain.MockRepoRegistry
	t *testing.T
}

func newRepoRegistry(t *testing.T) *tSafeRepoRegistry {
	t.Helper()
	reg := domain.NewMockRepoRegistry(t)
	t.Cleanup(func() { reg.AssertExpectations(t) })
	return &tSafeRepoRegistry{MockRepoRegistry: reg, t: t}
}

func withUow(t *testing.T) (*mockUow, *tSafeRepoRegistry) {
	t.Helper()
	reg := newRepoRegistry(t)
	return &mockUow{reg: reg}, reg
}

var ctx = context.Background()
