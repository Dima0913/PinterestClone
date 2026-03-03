import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { boardsService } from "../api/boards";
import "./CreateBoardModal.css";

const CreateBoardModal = ({ isOpen, onClose, onSuccess, pinId, onSavingPin }) => {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Будь ласка, введіть назву дошки");
      return;
    }

    if (!isAuthenticated) {
      setError("Будь ласка, увійдіть в систему");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const createdBoard = await boardsService.createBoard({
        name: name.trim(),
        description: description.trim() || null,
        group: group.trim() || null,
      });

      setName("");
      setDescription("");
      setGroup("");
      setError("");

      // Если нужно сохранить пин в доску, делаем это перед закрытием
      if (pinId && createdBoard?.id) {
        setSavingPin(true);
        if (onSavingPin) {
          onSavingPin(true);
        }
        try {
          await boardsService.addPinToBoard(createdBoard.id, pinId);
          // Закрываем модальное окно только после успешного сохранения
          if (onSuccess) {
            onSuccess(createdBoard);
          }
          onClose();
        } catch (err) {
          // Если пин уже сохранен, все равно закрываем
          if (err.response?.status === 400 && err.response?.data?.message?.includes("already")) {
            if (onSuccess) {
              onSuccess(createdBoard);
            }
            onClose();
          } else {
            setError("Дошку створено, але не вдалося зберегти пін. Спробуйте зберегти вручну.");
            setSavingPin(false);
            if (onSavingPin) {
              onSavingPin(false);
            }
          }
        }
      } else {
        // Если не нужно сохранять пин, просто закрываем
        if (onSuccess) {
          onSuccess(createdBoard);
        }
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Не вдалося створити дошку. Спробуйте ще раз."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving && !savingPin) {
      setName("");
      setDescription("");
      setGroup("");
      setError("");
      onClose();
    }
  };

  return createPortal(
    <div className="create-board-modal-overlay" onClick={handleClose}>
      <div
        className="create-board-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="create-board-modal-close" onClick={handleClose}>
          ×
        </button>

        <div className="create-board-modal-header">
          <h2>Створити дошку</h2>
        </div>

        <form onSubmit={handleSubmit} className="create-board-modal-form">
          {error && <div className="create-board-error">{error}</div>}
          {savingPin && (
            <div className="create-board-saving-pin">
              <div className="create-board-saving-spinner"></div>
              <span>Збереження піна в дошку...</span>
            </div>
          )}

          <div className="create-board-form-group">
            <label htmlFor="name">Назва *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад: Мої улюблені рецепти"
              maxLength={200}
              required
            />
          </div>

          <div className="create-board-form-group">
            <label htmlFor="description">Опис</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Додайте опис (необов'язково)"
              rows="3"
              maxLength={500}
            />
          </div>

          <div className="create-board-form-group">
            <label htmlFor="group">Група</label>
            <input
              type="text"
              id="group"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="Наприклад: Кулінарія (необов'язково)"
              maxLength={50}
            />
          </div>

          <div className="create-board-modal-footer">
            <button
              type="button"
              className="create-board-cancel-btn"
              onClick={handleClose}
              disabled={saving || savingPin}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="create-board-create-btn"
              disabled={saving || savingPin || !name.trim()}
            >
              {savingPin ? "Збереження піна..." : saving ? "Створення..." : "Створити"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateBoardModal;

