import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard, Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import * as dashboardApi from "@/api/dashboard";
import { DashboardStats, Payment } from "@/types";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.getDashboardStats(), dashboardApi.getUpcomingPayments()])
      .then(([statsData, upcomingData]) => {
        setStats(statsData);
        setUpcoming(upcomingData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="text-gray-500">Chargement...</p>;
  }

  if (!stats) {
    return <p className="text-gray-500">Impossible de charger les statistiques.</p>;
  }

  return (
    <div>
      <PageHeader title="Tableau de bord" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Contrats actifs" value={stats.activeContracts} hint={`${stats.totalContracts} au total`} />
        <StatCard label="Expirent sous 30 jours" value={stats.expiringContracts} />
        <StatCard label="Clients" value={stats.totalClients} />
        <StatCard label="Compagnies" value={stats.totalInsurers} />
        <StatCard label="Paiements en attente" value={stats.pendingPayments} />
        <StatCard label="Paiements en retard" value={stats.latePayments} />
        <StatCard
          label="Revenus encaissés"
          value={`${Number(stats.totalRevenueCollected).toLocaleString("fr-FR")} €`}
        />
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Prochaines échéances</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune échéance à venir.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-2 font-medium">Contrat</th>
                <th className="pb-2 font-medium">Client</th>
                <th className="pb-2 font-medium">Échéance</th>
                <th className="pb-2 font-medium">Montant</th>
                <th className="pb-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-50">
                  <td className="py-2">{payment.contract?.contractNumber}</td>
                  <td className="py-2">
                    {payment.contract?.client?.firstName} {payment.contract?.client?.lastName}
                  </td>
                  <td className="py-2">{new Date(payment.dueDate).toLocaleDateString("fr-FR")}</td>
                  <td className="py-2">{Number(payment.amount).toLocaleString("fr-FR")} €</td>
                  <td className="py-2">
                    <StatusBadge status={payment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}
