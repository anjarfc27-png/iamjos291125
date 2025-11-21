"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateSiteNavigationAction } from "../actions";

interface NavigationData {
  primary: string[];
  user: string[];
}

export function NavigationMenusTab({ initial }: { initial: NavigationData }) {
  const [primaryItems, setPrimaryItems] = useState(initial.primary);
  const [userItems, setUserItems] = useState(initial.user);
  const [newPrimaryItem, setNewPrimaryItem] = useState("");
  const [newUserItem, setNewUserItem] = useState("");
  const [editingPrimary, setEditingPrimary] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editPrimaryValue, setEditPrimaryValue] = useState("");
  const [editUserValue, setEditUserValue] = useState("");

  const addPrimaryItem = () => {
    if (newPrimaryItem.trim()) {
      setPrimaryItems([...primaryItems, newPrimaryItem.trim()]);
      setNewPrimaryItem("");
    }
  };

  const addUserItem = () => {
    if (newUserItem.trim()) {
      setUserItems([...userItems, newUserItem.trim()]);
      setNewUserItem("");
    }
  };

  const removePrimaryItem = (index: number) => {
    setPrimaryItems(primaryItems.filter((_, i) => i !== index));
  };

  const removeUserItem = (index: number) => {
    setUserItems(userItems.filter((_, i) => i !== index));
  };

  const startEditingPrimary = (index: number) => {
    setEditingPrimary(index);
    setEditPrimaryValue(primaryItems[index]);
  };

  const startEditingUser = (index: number) => {
    setEditingUser(index);
    setEditUserValue(userItems[index]);
  };

  const savePrimaryEdit = () => {
    if (editPrimaryValue.trim() && editingPrimary !== null) {
      const newItems = [...primaryItems];
      newItems[editingPrimary] = editPrimaryValue.trim();
      setPrimaryItems(newItems);
      setEditingPrimary(null);
      setEditPrimaryValue("");
    }
  };

  const saveUserEdit = () => {
    if (editUserValue.trim() && editingUser !== null) {
      const newItems = [...userItems];
      newItems[editingUser] = editUserValue.trim();
      setUserItems(newItems);
      setEditingUser(null);
      setEditUserValue("");
    }
  };

  const cancelEditing = () => {
    setEditingPrimary(null);
    setEditingUser(null);
    setEditPrimaryValue("");
    setEditUserValue("");
  };

  const movePrimaryItem = (index: number, direction: "up" | "down") => {
    const newItems = [...primaryItems];
    if (direction === "up" && index > 0) {
      [newItems[index], newItems[index - 1]] = [
        newItems[index - 1],
        newItems[index],
      ];
    } else if (direction === "down" && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [
        newItems[index + 1],
        newItems[index],
      ];
    }
    setPrimaryItems(newItems);
  };

  const moveUserItem = (index: number, direction: "up" | "down") => {
    const newItems = [...userItems];
    if (direction === "up" && index > 0) {
      [newItems[index], newItems[index - 1]] = [
        newItems[index - 1],
        newItems[index],
      ];
    } else if (direction === "down" && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [
        newItems[index + 1],
        newItems[index],
      ];
    }
    setUserItems(newItems);
  };

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="mb-4">
          <h2
            className="text-lg font-semibold text-gray-900"
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            Primary Navigation
          </h2>
          <p
            className="text-sm text-gray-600"
            style={{
              fontSize: "0.875rem",
              color: "#4B5563",
            }}
          >
            Menu utama yang tampil di bagian atas halaman depan jurnal.
          </p>
        </div>

        <div className="space-y-3">
          {primaryItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3"
              style={{
                fontSize: "0.875rem",
                padding: "0.75rem 1rem",
              }}
            >
              {editingPrimary === index ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editPrimaryValue}
                    onChange={(e) => setEditPrimaryValue(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm"
                    onKeyPress={(e) => e.key === "Enter" && savePrimaryEdit()}
                  />
                  <Button size="sm" onClick={savePrimaryEdit}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <span>{item}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => movePrimaryItem(index, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => movePrimaryItem(index, "down")}
                      disabled={index === primaryItems.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => startEditingPrimary(index)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePrimaryItem(index)}
                    >
                      Hapus
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Tambah menu baru..."
            value={newPrimaryItem}
            onChange={(e) => setNewPrimaryItem(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            onKeyPress={(e) => e.key === "Enter" && addPrimaryItem()}
          />
          <Button size="sm" onClick={addPrimaryItem}>
            Tambah
          </Button>
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <div className="mb-4">
          <h2
            className="text-lg font-semibold text-gray-900"
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            User Navigation
          </h2>
          <p
            className="text-sm text-gray-600"
            style={{
              fontSize: "0.875rem",
              color: "#4B5563",
            }}
          >
            Menu untuk user yang tampil di pojok kanan atas saat login.
          </p>
        </div>

        <div className="space-y-3">
          {userItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3"
              style={{
                fontSize: "0.875rem",
                padding: "0.75rem 1rem",
              }}
            >
              {editingUser === index ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editUserValue}
                    onChange={(e) => setEditUserValue(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm"
                    onKeyPress={(e) => e.key === "Enter" && saveUserEdit()}
                  />
                  <Button size="sm" onClick={saveUserEdit}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <span>{item}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveUserItem(index, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveUserItem(index, "down")}
                      disabled={index === userItems.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => startEditingUser(index)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUserItem(index)}
                    >
                      Hapus
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Tambah menu baru..."
            value={newUserItem}
            onChange={(e) => setNewUserItem(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            onKeyPress={(e) => e.key === "Enter" && addUserItem()}
          />
          <Button size="sm" onClick={addUserItem}>
            Tambah
          </Button>
        </div>
      </div>

      <form action={updateSiteNavigationAction} className="flex justify-end">
        <input type="hidden" name="primary" value={primaryItems.join(",")} />
        <input type="hidden" name="user" value={userItems.join(",")} />
        <Button type="submit">Simpan Semua Menu</Button>
      </form>
    </>
  );
}
