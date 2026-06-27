package seedbilling

import (
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/egolia-uit/egolia/internal/billing/infra/persistence/model"
)

func NewSeedForSQL() *Seed {
	return &Seed{db: nil}
}

func (s *Seed) PrintSQL(w io.Writer) {
	transactions := s.createTransactions()

	fmt.Fprintln(w, "BEGIN;") //nolint:errcheck
	fmt.Fprintln(w)           //nolint:errcheck

	for _, t := range transactions {
		writeTransactionSQL(w, t)
	}

	fmt.Fprintln(w, "COMMIT;") //nolint:errcheck
}

func writeTransactionSQL(w io.Writer, t model.Transaction) {
	fmt.Fprintf(w, //nolint:errcheck
		"INSERT INTO transactions (id, user_id, course_id, course_title, amount, status, paid_at, created_at, updated_at)\n"+
			"VALUES ('%s', %s, '%s', %s, %d, %s, %s, %s, %s)\n"+
			"ON CONFLICT (id) DO UPDATE SET\n"+
			"  user_id = EXCLUDED.user_id,\n"+
			"  course_id = EXCLUDED.course_id,\n"+
			"  course_title = EXCLUDED.course_title,\n"+
			"  amount = EXCLUDED.amount,\n"+
			"  status = EXCLUDED.status,\n"+
			"  paid_at = EXCLUDED.paid_at,\n"+
			"  updated_at = EXCLUDED.updated_at;\n\n",
		t.ID,
		pgStr(t.UserID),
		t.CourseID,
		pgStr(t.CourseTitle),
		t.Amount,
		pgStr(string(t.Status)),
		pgNullTime(t.PaidAt),
		pgTimestamp(t.CreatedAt),
		pgTimestamp(t.UpdatedAt),
	)
}

func pgStr(s string) string {
	return "'" + strings.ReplaceAll(s, "'", "''") + "'"
}

func pgTimestamp(t time.Time) string {
	if t.IsZero() {
		return "NOW()"
	}
	return "'" + t.UTC().Format("2006-01-02 15:04:05.999999Z07:00") + "'"
}

func pgNullTime(t *time.Time) string {
	if t == nil {
		return "NULL"
	}
	return pgTimestamp(*t)
}
