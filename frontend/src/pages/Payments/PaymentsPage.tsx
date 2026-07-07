import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import * as paymentsApi from "@/api/payments";
import { Payment, PaymentStatus } from "@/types";

const statuses: PaymentStatus[] = ["PENDING", "PAID", "LATE", "CANCELLED"];

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    try {
      const data = await paymentsApi.listPayments(statusFilter ? { status: statusFilter } : {});
      setPayments(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function markAsPaid(payment: Payment) {
    await paymentsApi.updatePayment(payment.id, { status: "PAID" });
    await load();
  }

  return (
    <div>
      <PageHeader title="Paiements" />

      <Card className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </Card>

      <Card>
        {isLoading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun paiement.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-2 font-medium">Contrat</th>
                <th className="pb-2 font-medium">Client</th>
                <th className="pb-2 font-medium">Échéance</th>
                <th className="pb-2 font-medium">Montant</th>
                <th className="pb-2 font-medium">Statut</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-50">
                  <td className="py-2">
                    <Link to={`/contracts/${payment.contractId}`} className="text-primary-600 hover:underline">
                      {payment.contract?.contractNumber}
                    </Link>
                  </td>
                  <td className="py-2">
                    {payment.contract?.client?.firstName} {payment.contract?.client?.lastName}
                  </td>
                  <td className="py-2">{new Date(payment.dueDate).toLocaleDateString("fr-FR")}</td>
                  <td className="py-2">{Number(payment.amount).toLocaleString("fr-FR")} €</td>
                  <td className="py-2">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="py-2 text-right">
                    {payment.status !== "PAID" && (
                      <button onClick={() => markAsPaid(payment)} className="text-primary-600 hover:underline">
                        Marquer payé
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
