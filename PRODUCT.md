# Expense Management System
Tagline: Track, categorize, and understand your finances in one web app.

## Overview
Expense Management System is a web application that helps users track and categorize their expenses and incomes, reconcile balances, and gain insights across multiple accounts. Its core entities include Transaction (Income, Expense, Transfer, Manual balance change) and Account (Bank account, Credit Card). The system also supports invoices for credit cards to model future payments.

## Problem
Users struggle to keep accurate records, consistently categorize transactions, and reconcile balances across multiple accounts, leading to gaps, errors, and missed insights.

## Solution
The system provides a cohesive ledger to:
- Record and categorize transactions (Income, Expense, Transfer)
- Manage balances across Bank and Credit Card accounts, including invoices for future payments
- Support manual balance changes for initial setup or reconciliation fixes
- Handle invoices that generate future transfers when paid

## Key Features
- Transaction management: Create and categorize transactions (Income, Expense, Transfer) with supporting manual balance adjustments.
- Multi-account ledger: Maintain balances across Bank accounts and Credit Cards, including invoicing support.
- Manual balance adjustments: Set initial balances and fix balance discrepancies as needed.
- Invoices and future payments: Model credit-card invoices and their associated future transfers.

## Getting Started
- Quick Start: Create your first Bank account with an initial balance, then log a few sample transactions (Income/Expense/Transfer) to see the ledger in action.
- Import data (optional): Import bank or card statements to populate transactions.
- Explore: Review balances, run simple summaries, and verify consistency across accounts.

## Roadmap (high level)
- Q2 2026: Basic Bank Account implementation with balance tracking and core Bank account transactions (Income, Expense, Transfer)
- Q3 2026: Invoices, credit-card handling
- Q4 2026: Reconciliation features (OFX import reconciliation; plan to integrate external services like OpenFinance)
- Q1 2027: Enhanced analytics and reporting dashboards

Notes: This is a living document; details may evolve as the product grows.
