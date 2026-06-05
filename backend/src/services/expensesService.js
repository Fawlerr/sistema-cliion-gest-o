import { query } from "../db/pool.js";
import { ApiError } from "../lib/apiError.js";

const expenseSelect = `
  SELECT
    id,
    description,
    amount,
    "expenseDate",
    "createdAt"
  FROM expenses
`;

export async function listExpenses() {
  const result = await query(`${expenseSelect} ORDER BY "expenseDate" DESC, id DESC`);
  return result.rows;
}

export async function getExpenseById(id) {
  const result = await query(`${expenseSelect} WHERE id = $1`, [id]);

  if (!result.rowCount) {
    throw new ApiError(404, "Expense not found.");
  }

  return result.rows[0];
}

export async function createExpense({ description, amount, expenseDate }) {
  const result = await query(
    `
      INSERT INTO expenses (description, amount, "expenseDate")
      VALUES ($1, $2, $3)
      RETURNING
        id,
        description,
        amount,
        "expenseDate",
        "createdAt"
    `,
    [description, amount, expenseDate]
  );

  return result.rows[0];
}

export async function updateExpense(id, { description, amount, expenseDate }) {
  const result = await query(
    `
      UPDATE expenses
      SET
        description = $2,
        amount = $3,
        "expenseDate" = $4
      WHERE id = $1
      RETURNING
        id,
        description,
        amount,
        "expenseDate",
        "createdAt"
    `,
    [id, description, amount, expenseDate]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Expense not found.");
  }

  return result.rows[0];
}
