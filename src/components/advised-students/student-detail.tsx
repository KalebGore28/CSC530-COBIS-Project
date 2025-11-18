import { Modal } from '@/components/ui/custom/modal';
import { StudentDetail } from '../ui/custom/student-detail';

type StudentDetailProps = {
    studentMnumber: string;
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
};

export function StudentDetailModal({ studentMnumber, modalOpen, setModalOpen }: StudentDetailProps) {

    return (
        <Modal
            isOpen={modalOpen}
            onClose={() => {
                setModalOpen(false);
            }}
            title="Student Detail"
            description="View the details of this student."
            size="xl"
        >
            <div className="flex flex-col p-4 w-full max-h-[80vh] overflow-y-auto">
                <StudentDetail mnumber={studentMnumber} />
            </div>
        </Modal>
    )
}