from flask import Flask, request, jsonify
from collections import defaultdict

app = Flask(__name__)

class Splitwise:
    def __init__(self):
        self.graph = defaultdict(lambda: defaultdict(float))

    def add_transaction(self, payer, amount, participants):
        num_participants = len(participants)
        if num_participants == 0:
            return
        
        share = amount / num_participants
        for participant in participants:
            if participant != payer:
                self.graph[participant][payer] += share

    def unequal(self, payer, amount, participants):
        num_participants = len(participants)
        if num_participants == 0:
            return
        if amount != sum(participants.values()):
            return "Total not equal to amount", 400
        for participant in participants:
            if participant != payer:
                self.graph[participant][payer] += participants[participant]

    def multiple_payee(self, paid_by, owed_shares):
        total_paid = sum(paid_by.values())
        total_owed = sum(owed_shares.values())
        
        if not abs(total_paid - total_owed) < 1e-6:
            raise ValueError("Total paid must equal total owed")

        nets = defaultdict(float)
        for user, amount in paid_by.items():
            nets[user] += amount
        for user, amount in owed_shares.items():
            nets[user] -= amount

        creditors, debtors = [], []
        for user, net in nets.items():
            if net > 1e-6:
                creditors.append((user, net))
            elif net < -1e-6:
                debtors.append((user, -net))

        total_credit = sum(amt for _, amt in creditors)
        for debtor, debt_amt in debtors:
            if total_credit < 1e-6:
                continue
            for creditor, credit_amt in creditors:
                proportion = credit_amt / total_credit
                amount = debt_amt * proportion
                self.graph[debtor][creditor] += amount

    def simplify_debts(self):
        net_balances = defaultdict(float)
        for debtor, creditors in self.graph.items():
            for creditor, amount in creditors.items():
                net_balances[debtor] -= amount
                net_balances[creditor] += amount

        creditors, debtors = [], []
        for user, balance in net_balances.items():
            if balance > 1e-6:
                creditors.append((user, balance))
            elif balance < -1e-6:
                debtors.append((user, -balance))

        creditors.sort(key=lambda x: -x[1])
        debtors.sort(key=lambda x: -x[1])

        new_graph = defaultdict(lambda: defaultdict(float))
        while creditors and debtors:
            creditor, credit_amt = creditors[0]
            debtor, debt_amt = debtors[0]
            settle_amt = min(credit_amt, debt_amt)
            new_graph[debtor][creditor] += settle_amt
            if credit_amt == settle_amt:
                creditors.pop(0)
            else:
                creditors[0] = (creditor, credit_amt - settle_amt)
            if debt_amt == settle_amt:
                debtors.pop(0)
            else:
                debtors[0] = (debtor, debt_amt - settle_amt)

        self.graph = new_graph

    def get_balances(self):
        balances = defaultdict(float)
        for debtor, creditors in self.graph.items():
            for creditor, amount in creditors.items():
                balances[debtor] -= amount
                balances[creditor] += amount
        return balances

    def __str__(self):
        output = []
        for debtor in self.graph:
            for creditor, amount in self.graph[debtor].items():
                if amount > 1e-6:
                    output.append(f"{debtor} owes {creditor} ${amount:.2f}")
        return "\n".join(output) if output else "No debts"

# Instantiate the Splitwise class
splitwise_app = Splitwise()

# Flask routes


if __name__ == '__main__':
    app.run(debug=True)
