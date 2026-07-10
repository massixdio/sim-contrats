import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import * as contractsApi from "@/api/contracts";
import * as paymentsApi from "@/api/payments";
import { Contract } from "@/types";

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    if (!id) return;
    setIsLoading(true);
    try {
      setContract(await contractsApi.getContract(id));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function markAsPaid(paymentId: string) {
    await paymentsApi.updatePayment(paymentId, { status: "PAID" });
    await load();
  }

  async function handleDelete() {
    if (!contract || !confirm(`Supprimer le contrat ${contract.contractNumber} ?`)) return;
    await contractsApi.deleteContract(contract.id);
    navigate("/contracts");
  }

  if (isLoading) return <p className="text-gray-500">Chargement...</p>;
  if (!contract) return <p className="text-gray-500">Contrat introuvable.</p>;

  return (
    <div>
      <PageHeader
        title={`Contrat ${contract.contractNumber}`}
        actions={
          <div className="flex gap-2">
            <Link
              to="/contracts"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retour
            </Link>
            <button
              onClick={handleDelete}
              className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Supprimer
            </button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Informations générales</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Statut</dt>
              <dd>
                <StatusBadge status={contract.status} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Type</dt>
              <dd>{contract.type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Prime totale</dt>
              <dd>{Number(contract.premiumAmount).toLocaleString("fr-FR")} €</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Fréquence</dt>
              <dd>{contract.paymentFrequency}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Début</dt>
              <dd>{new Date(contract.startDate).toLocaleDateString("fr-FR")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Fin</dt>
              <dd>{new Date(contract.endDate).toLocaleDateString("fr-FR")}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Client & Compagnie</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Client</dt>
              <dd>
                {contract.client && (
                  <Link to="/clients" className="text-primary-600 hover:underline">
                    {contract.client.firstName} {contract.client.lastName}
                  </Link>
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email client</dt>
              <dd>{contract.client?.email || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Compagnie</dt>
              <dd>{contract.insurer?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Contact compagnie</dt>
              <dd>{contract.insurer?.contactEmail || "—"}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Échéancier des paiements</h2>
        {!contract.payments || contract.payments.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune échéance.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-2 font-medium">Échéance</th>
                <th className="pb-2 font-medium">Montant</th>
                <th className="pb-2 font-medium">Statut</th>
                <th className="pb-2 font-medium">Date de paiement</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {contract.payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-50">
                  <td className="py-2">{new Date(payment.dueDate).toLocaleDateString("fr-FR")}</td>
                  <td className="py-2">{Number(payment.amount).toLocaleString("fr-FR")} €</td>
                  <td className="py-2">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="py-2">{payment.paidDate ? new Date(payment.paidDate).toLocaleDateString("fr-FR") : "—"}</td>
                  <td className="py-2 text-right">
                    {payment.status !== "PAID" && (
                      <button onClick={() => markAsPaid(payment.id)} className="text-primary-600 hover:underline">
                        Marquer payé
                      </button>
                    )}
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
