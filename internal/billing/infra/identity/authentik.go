package identity

import (
	"context"
	"strconv"

	"github.com/egolia-uit/egolia/internal/billing/core"
	commonconfig "github.com/egolia-uit/egolia/pkg/common/config"
	"goauthentik.io/api/v3"
	"golang.org/x/sync/errgroup"
)

type Authentik struct {
	client *api.APIClient
	token  string
}

func NewAuthentik(
	cfg *commonconfig.Authentik,
) *Authentik {
	authentikCfg := api.NewConfiguration()
	authentikCfg.Host = cfg.Host
	authentikCfg.Servers = api.ServerConfigurations{
		{
			URL: cfg.URL,
		},
	}
	client := api.NewAPIClient(authentikCfg)
	return &Authentik{
		client: client,
		token:  cfg.Token,
	}
}

var ProvideAuthentik = NewAuthentik

var _ core.IdentitySvc = (*Authentik)(nil)

func (a *Authentik) GetUser(ctx context.Context, userID string) (*core.User, error) {
	ctx = context.WithValue(ctx, api.ContextAccessToken, a.token)
	id, err := strconv.Atoi(userID)
	if err != nil {
		return nil, err // TODO: map to app error
	}
	user, _, err := a.client.CoreApi.CoreUsersRetrieve(ctx, int32(id)).Execute()
	if err != nil {
		return nil, err // TODO: map to app error
	}
	return a.toUser(user), nil
}

func (a *Authentik) GetUsers(ctx context.Context, userIDs []string) ([]*core.User, error) {
	ctx = context.WithValue(ctx, api.ContextAccessToken, a.token)
	result := make([]*core.User, len(userIDs))

	g, ctx := errgroup.WithContext(ctx)
	g.SetLimit(10)

	for i, userID := range userIDs {
		g.Go(func() error {
			id, err := strconv.Atoi(userID)
			if err != nil {
				return err // TODO: map to app error
			}

			user, _, err := a.client.CoreApi.CoreUsersRetrieve(ctx, int32(id)).Execute()
			if err != nil {
				return err // TODO: map to app error
			}

			result[i] = a.toUser(user)
			return nil
		})
	}

	if err := g.Wait(); err != nil {
		return nil, err
	}

	return result, nil
}

func (a *Authentik) toUser(user *api.User) *core.User {
	return &core.User{
		ID:    strconv.FormatInt(int64(user.GetPk()), 10),
		Name:  user.GetName(),
		Email: user.GetEmail(),
	}
}
