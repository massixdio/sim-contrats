import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { StatusBadge } from "@/components/StatusBadge";
import * as contractsApi from "@/api/contracts";
import * as clientsApi from "@/api/clients";
import * as insurersApi from "@/api/insurers";
import { Contract, ContractStatus, ContractType, Client, Insurer } from "@/types";

const contractTypes: ContractType[] = ["AUTO", "HABITATION", "SANTE", "VIE", "RESPONSABILITE_CIVILE", "AUTRE"];
const contractStatuses: ContractStatus[] = ["ACTIVE", "PENDING", "EXPIRED", "CANCELLED"];

const typeLabels: Record<ContractType, string> = {
  AUTO: "Auto",
  HABITATION: "Habitation",
  SANTE: "Santé",
  VIE: "Vie",
  RESPONSABILITE_CIVILE: "Responsabilité civile",
  AUTRE: "Autre",
};

const emptyForm = {
  contractNumber: "",
  type: "AUTO" as ContractType,
  startDate: "",
  endDate: "",
  premiumAmount: "",
  paymentFrequency: "MONTHLY" as Contract["paymentFrequency"],
  clientId: "",
  insurerId: "",
  notes: "",
};

export function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const data = await contractsApi.listContracts(statusFilter ? { status: statusFilter } : {});
      setContracts(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    clientsApi.listClients().then(setClients);
    insurersApi.listInsurers().then(setInsurers);
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await contractsApi.createContract({
        ...form,
        premiumAmount: Number(form.premiumAmount),
      });
      setShowForm(false);
      await load();
    } catch {
      setError("Erreur lors de la création du contrat. Vérifiez les champs.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Contrats"
        actions={
          <button
            onClick={openCreate}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            + Nouveau contrat
          </button>
        }
      />

      <Card className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ContractStatus | "")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          {contractStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </Card>

      <Card>
        {isLoading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : contracts.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun contrat.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-2 font-medium">N° Contrat</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Client</th>
                <th className="pb-2 font-medium">Compagnie</th>
                <th className="pb-2 font-medium">Prime</th>
                <th className="pb-2 font-medium">Échéance</th>
                <th className="pb-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b border-gray-50">
                  <td className="py-2">
                    <Link to={`/contracts/${contract.id}`} className="text-primary-600 hover:underline">
                      {contract.contractNumber}
                    </Link>
                  </td>
                  <td className="py-2">{typeLabels[contract.type]}</td>
                  <td className="py-2">
                    {contract.client?.firstName} {contract.client?.lastName}
                  </td>
                  <td className="py-2">{contract.insurer?.name}</td>
                  <td className="py-2">{Number(contract.premiumAmount).toLocaleString("fr-FR")} €</td>
                  <td className="py-2">{new Date(contract.endDate).toLocaleDateString("fr-FR")}</td>
                  <td className="py-2">
                    <StatusBadge status={contract.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>

      {showForm && (
        <Modal title="Nouveau contrat" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Numéro de contrat</label>
              <input
                required
                value={form.contractNumber}
                onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Client</label>
                <select
                  required
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Compagnie</label>
                <select
                  required
                  value={form.insurerId}
                  onChange={(e) => setForm({ ...form, insurerId: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner...</option>
                  {insurers.map((insurer) => (
                    <option key={insurer.id} value={insurer.id}>
                      {insurer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ContractType })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  {contractTypes.map((type) => (
                    <option key={type} value={type}>
                      {typeLabels[type]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fréquence de paiement</label>
                <select
                  value={form.paymentFrequency}
                  onChange={(e) =>
                    setForm({ ...form, paymentFrequency: e.target.value as Contract["paymentFrequency"] })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="MONTHLY">Mensuelle</option>
                  <option value="QUARTERLY">Trimestrielle</option>
                  <option value="YEARLY">Annuelle</option>
                  <option value="ONE_TIME">Unique</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Date de début</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Date de fin</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Prime totale (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.premiumAmount}
                onChange={(e) => setForm({ ...form, premiumAmount: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={2}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Créer le contrat
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
