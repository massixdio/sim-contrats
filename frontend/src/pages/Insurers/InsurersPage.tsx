import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import * as insurersApi from "@/api/insurers";
import { Insurer } from "@/types";

const emptyForm = { name: "", contactEmail: "", contactPhone: "", address: "" };

export function InsurersPage() {
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Insurer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      setInsurers(await insurersApi.listInsurers());
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(insurer: Insurer) {
    setEditing(insurer);
    setForm({
      name: insurer.name,
      contactEmail: insurer.contactEmail ?? "",
      contactPhone: insurer.contactPhone ?? "",
      address: insurer.address ?? "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await insurersApi.updateInsurer(editing.id, form);
      } else {
        await insurersApi.createInsurer(form);
      }
      setShowForm(false);
      await load();
    } catch {
      setError("Erreur lors de l'enregistrement de la compagnie");
    }
  }

  async function handleDelete(insurer: Insurer) {
    if (!confirm(`Supprimer la compagnie ${insurer.name} ?`)) return;
    try {
      await insurersApi.deleteInsurer(insurer.id);
      await load();
    } catch {
      alert("Impossible de supprimer cette compagnie (des contrats y sont liés).");
    }
  }

  return (
    <div>
      <PageHeader
        title="Compagnies d'assurance"
        actions={
          <button
            onClick={openCreate}
            className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
          >
            + Nouvelle compagnie
          </button>
        }
      />

      <Card>
        {isLoading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : insurers.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune compagnie.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-2 font-medium">Nom</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Téléphone</th>
                <th className="pb-2 font-medium">Contrats</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {insurers.map((insurer) => (
                <tr key={insurer.id} className="border-b border-gray-50">
                  <td className="py-2">{insurer.name}</td>
                  <td className="py-2">{insurer.contactEmail || "—"}</td>
                  <td className="py-2">{insurer.contactPhone || "—"}</td>
                  <td className="py-2">{insurer._count?.contracts ?? 0}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => openEdit(insurer)} className="mr-3 text-primary-600 hover:underline">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(insurer)} className="text-red-600 hover:underline">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>

      {showForm && (
        <Modal title={editing ? "Modifier la compagnie" : "Nouvelle compagnie"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nom</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email de contact</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Adresse</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
