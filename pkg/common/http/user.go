package commonhttp

import (
	"context"
	"encoding/json"

	"github.com/gin-gonic/gin"
)

type User struct {
	ID     string   `json:"id"`
	Email  string   `json:"email"`
	Groups []string `json:"groups"`
	Roles  []string `json:"roles"`
}

func unmarshalHeader(headerValue string) []string {
	var list []string
	if headerValue == "" {
		return []string{}
	}
	if err := json.Unmarshal([]byte(headerValue), &list); err != nil {
		return []string{}
	}
	return list
}

type userCtxKey int

const UserCtxKey userCtxKey = iota

func UserFromContext(ctx context.Context) (*User, bool) {
	c, ok := ctx.(*gin.Context)
	if !ok {
		return nil, false
	}
	u, ok := c.Get(UserCtxKey)
	if !ok {
		return nil, false
	}
	user, ok := u.(*User)
	return user, ok
}

func GatewayUserAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		user := &User{
			ID:     c.GetHeader("X-Forwarded-ID"),
			Email:  c.GetHeader("X-Forwarded-Email"),
			Groups: unmarshalHeader(c.GetHeader("X-Forwarded-Groups")),
			Roles:  unmarshalHeader(c.GetHeader("X-Forwarded-Roles")),
		}
		c.Set(UserCtxKey, user)
		c.Next()
	}
}
