import React, {useState, useEffect} from "react";
import MessageModal from "@/components/ui/MessageModal";

export default function HardDeleteAlertModal({isShowRealDeleteModal, setIsShowRealDeleteModal, selectedResvCode, onDeleteSuccess, userInfo}){
     const SHOP_CODE = userInfo?.shopCode;
        const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${SHOP_CODE}/reservation`;

        const hardDeleteHandler = async() => {
        try{
            const response = await fetch(`${API_BASE_URL}/${selectedResvCode}`,{
                method : "DELETE",
                headers : {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    "Content-Type" : "application/json"
                },
            });
    
            const contentType = response.headers.get("Content-Type");
    
            if(contentType && contentType.includes("application/json")) {
                const data = await response.json();
                console.log('예약 삭제 성공 (?) : ', data);
                setIsShowRealDeleteModal(false);
                if (onDeleteSuccess) {
                    onDeleteSuccess();
                }
            } else {
                    const text = await response.text();
                    console.warn("받은 응답이 JSON이 아님 : ", text);
                }
            } catch(error){
                console.error('예약 취소 실패 : ', error)
            }
        } 
        
        return (
            <>
                <MessageModal
                    isOpen={isShowRealDeleteModal}
                    onClose={() => setIsShowRealDeleteModal(false)}
                    onConfirm={async() => await hardDeleteHandler()}
                    type="confirm"
                    title="예약 삭제"
                    message={
                        <>
                            예약 내역을 삭제하시면 매출에 영향을 미칠 수 있습니다.
                            <br />
                            정말 해당 예약 내역을 삭제하시겠습니까?
                        </>
                    }
                    confirmText="삭제"
                    cancelText="취소"
                    showCancel={true}
                />
            </>
        )
}