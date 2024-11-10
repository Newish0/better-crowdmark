import React, { useEffect, useRef } from "react";
import styles from "./Modal.module.css";
import { XIcon } from "lucide-react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [open]);

    return (
        <>
            <dialog ref={dialogRef} className={styles.modal}>
                <div className={styles.modalContainer}>
                    <form method="dialog" className={styles.modalCloseForm}>
                        {/* if there is a button in form, it will close the modal */}
                        <button type="button" onClick={onClose}>
                            <XIcon />
                        </button>
                    </form>

                    <div className={styles.modalContent}>{children}</div>
                </div>
            </dialog>
        </>
    );
};
