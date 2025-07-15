export const MESSAGES = {
    CATEGORY: {
        CREATE_SUCCESS: '그룹이 성공적으로 생성되었습니다.',
        UPDATE_SUCCESS: '그룹이 성공적으로 수정되었습니다.',
        DELETE_SUCCESS: '그룹이 성공적으로 삭제되었습니다.',
        
        CREATE_ERROR: '그룹 생성에 실패했습니다.',
        UPDATE_ERROR: '그룹 수정에 실패했습니다.',
        DELETE_ERROR: '그룹 삭제에 실패했습니다.',
        
        DELETE_CONFIRM: (name) => `'${name}' 그룹을 정말로 삭제하시겠습니까?\n해당 그룹에 속한 모든 시술도 함께 삭제됩니다. 삭제된 데이터는 복구할 수 없습니다.`,
        
        VALIDATION_NAME: '그룹 이름을 입력해주세요.',
        DUPLICATE_ERROR: '이미 존재하는 그룹입니다.',
        NOT_FOUND: '그룹을 찾을 수 없습니다.'
    },
    MENU: {
        CREATE_SUCCESS: '시술이 성공적으로 등록되었습니다.',
        UPDATE_SUCCESS: '시술이 성공적으로 수정되었습니다.',
        DELETE_SUCCESS: '시술이 성공적으로 삭제되었습니다.',
        
        CREATE_ERROR: '시술 등록에 실패했습니다.',
        UPDATE_ERROR: '시술 수정에 실패했습니다.',
        DELETE_ERROR: '시술 삭제에 실패했습니다.',
        
        DELETE_CONFIRM: (name) => `'${name}' 시술을 정말로 삭제하시겠습니까?\n\n삭제된 시술은 복구할 수 없습니다.`,
        
        VALIDATION_CATEGORY: '시술 그룹을 선택해주세요.',
        VALIDATION_NAME: '시술 이름을 입력해주세요.',
        VALIDATION_TIME: '시술 시간을 입력해주세요.',
        VALIDATION_PRICE: '가격을 입력해주세요.',
        
        NOT_FOUND: '시술을 찾을 수 없습니다.'
    },
    COMMON: {
        NETWORK_ERROR: '네트워크 연결을 확인해주세요.\n서버에 접근할 수 없습니다.',
        SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
        VALIDATION_ERROR: '입력 정보를 확인해주세요.',
        CANNOT_DELETE: '삭제할 수 없는 항목입니다.',
        PROCESS_ERROR: '요청 처리 중 오류가 발생했습니다.'
    }
};