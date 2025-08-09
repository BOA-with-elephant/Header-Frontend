import React, {useState, useEffect} from "react";
import MessageModal from "@/components/ui/MessageModal";


export default function DeleteAlertModal({isShowDeleteModal, setIsShowDeleteModal, setIsShowModal, selectedResvCode, fetchReservationData, fetchSearchResult}){

    const SHOP_CODE = 1; 
    const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${SHOP_CODE}/reservation`;
    // const API_BASE_URL = `http://localhost:8080/api/v1/my-shops/${SHOP_CODE}/reservation`;

    useEffect(() => {
        setIsShowModal(false);
    }, []);

    const softDeleteHandler = async() => {
    try{
        const response = await fetch(`${API_BASE_URL}/${selectedResvCode}`,{
            method : "PATCH",
            headers : {
                "Content-Type" : "application/json"
            },
        });

        const contentType = response.headers.get("Content-Type");

        if(contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log('예약 취소 성공 (?) : ', data);
            await fetchReservationData();
            setIsShowDeleteModal(false);
            await fetchSearchResult();
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
                isOpen={isShowDeleteModal}
                onClose={() => setIsShowDeleteModal(false)}
                onConfirm={async() => await softDeleteHandler()}
                type="confirm"
                title="예약 취소"
                message="정말 해당 예약을 취소하시겠습니까?"
                confirmText="삭제"
                cancelText="취소"
                showCancel={true}
            />
        </>
    )
}