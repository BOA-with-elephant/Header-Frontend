import MessageModal from '@/components/ui/MessageModal';

export default function SuccessMessageModal({
    isShowMessageModal, 
    setIsShowMessageModal, 
    resultMessage, 
    resultTitle,
    resultType,
    setIsCloseComplete,
    messageContext
}) {

    const handleConfirm = () => {
    
        setIsShowMessageModal(false);
        
        if(messageContext === 'update' && setIsCloseComplete){
            setIsCloseComplete(true);
        }
    };

    return(
        <>
            <MessageModal
                isOpen={isShowMessageModal}
                onClose={() => {
                    setIsShowMessageModal(false);
                    if(setIsCloseComplete){
                        setIsCloseComplete(true);
                    }
                }}
                onConfirm={handleConfirm}
                type={resultType}
                title={resultTitle}
                message={resultMessage}
                confirmText="확인"
                showCancel={false}
            />
        </>
    )
}