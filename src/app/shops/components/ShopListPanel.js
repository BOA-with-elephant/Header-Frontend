'use client';
import {useState, useEffect, useCallback} from "react";
import useInfiniteScroll from "@/app/shops/util/useInfiniteScroll";
import 'src/styles/user/shops/ShopFinder.css'

export default function ShopListPanel({shops, setShops, onShopSelect, userLocation}) {
    // 상태 관리
    const [category, setCategory] = useState([]); // 카테고리 목록
    const [page, setPage] = useState(0); // 현재 페이지
    const [hasMore, setHasMore] = useState(true); // 더 부를 데이터가 있는지 확인
    const [loading, setLoading] = useState(false); //로딩 상태

    // 필터(키워드, 카테고리) 상태
    const [keyword, setKeyword] = useState(''); // 검색 키워드
    const [selectedCategory, setSelectedCategory] = useState(''); // 선택된 카테고리 코드

    // 샵 목록 가져오기 함수, callback 사용
    const fetchShops = useCallback(async (isNewSearch = false) => {
        // 이미 로딩 중 혹은 더 이상 불러올 데이터 없고 and 새로운 검색 아니면 종료
        if (loading || (!hasMore && !isNewSearch)) return;

        setLoading(true); // 로딩 시작

        // 새로운 검색이면 첫 페이지부터, 아니면 현재 페이지
        const currentPage = isNewSearch? 0 : page;

        // URL 파라미터 생성, page 필수값이라 넣어줌
        const params = new URLSearchParams({page: currentPage});
        // 있는 데이터에 따라 param append
        if (userLocation) {
            params.append('latitude', userLocation.latitude);
            params.append('longitude', userLocation.longitude);
        }
        if (selectedCategory) params.append('category', selectedCategory);
        if (keyword) params.append('keyword', keyword);

        try {
            // const res = await fetch(`http://localhost:8080/api/v1/shops?${params.toString()}`);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/shops?${params.toString()}`);
            const data = await res.json();
            console.log(data) // 샵 데이터 형태 확인
            if (res.ok && data.results) {
                const newShops = data.results.shops || []; // results 내부-shops 구조의 json

                // 키워드 검색 필터링
                if (keyword && newShops.length > 0) {
                    let maxRevCount = -1;

                    // 키워드가 메뉴 이름일 때 처리
                    newShops.forEach(shop => {
                        shop.menus?.forEach(menu => {
                            if (menu.menuName.includes(keyword) && menu.menuRevCount > maxRevCount) {
                                maxRevCount = menu.menuRevCount;
                            }
                        });
                    });

                    // 메뉴의 예약 횟수가 1회 이상일 때만 메시지 출력
                    if (maxRevCount > 0){
                        newShops.forEach(shop => {
                            const bestMenu = shop.menus?.find(menu => menu.menuName.includes(keyword) && menu.menuRevCount == maxRevCount);
                            if(bestMenu) {
                                shop.adMessage = `최근 ${bestMenu.menuName} ${bestMenu.menuRevCount}회 예약`;
                            }
                        })
                    }
                }
                // 새로운 검색이면 기존 데이터 교체, 아니면 추가
                setShops(prev => {
                    if (isNewSearch) return newShops;
                    const existingShopCodes = new Set(prev.map(s => s.shopCode));
                    const uniqueNewShops = newShops.filter(s => !existingShopCodes.has(s.shopCode));
                    return [...prev, ...uniqueNewShops];
                })

                setPage(currentPage + 1);
                setHasMore(newShops.length > 0) // 더 불러올 데이터 있으면 true
            } else {
                throw new Error(data.message || '매장 목록을 불러오는데 실패했습니다') // 백에서 에러 처리해둔 메시지 혹은 기본 문구 사용
            }
        } catch (e) {
            console.log('매장 목록 패치 실패 : ' + e);
        } finally {
            setLoading(false); //로딩 종료
        }
    }, [page, hasMore, loading, userLocation, selectedCategory, keyword]);

    // 로딩 중이 아니고, 더 불러올 목록이 있는 경우 무한 스크롤 사용
    const loadNextPage = useInfiniteScroll(() => {
        if (!loading && hasMore) {
            fetchShops(); // 샵 한번 더 fetch
        }
    })

    const handleSearch = () => {
        setShops([]); // 기존 데이터 초기화
        setPage(0); // 페이지 초기화
        setHasMore(true) // 더 불러올 데이터 있다고 설정
    }

    // hasMore(true), shops.empty
    useEffect(() => {
        if (hasMore && shops.length === 0) {
            fetchShops(true);
        }
    }, [hasMore, shops.length, fetchShops]);

    // 카테고리 목록 불러오기
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                // const res = await fetch('http://localhost:8080/api/v1/shops/categories');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/shops/categories`);
                const data = await res.json();
                if (res.ok) {
                    setCategory(data.results['shop-categories']);
                }
            } catch (e) {
                console.log('카테고리 패치 실패 : ' + e);
            }
        };
        fetchCategory();
    }, []); // 최초에만 실행

    return (
        <div className={'side-panel'}>

            {/*카테고리 필터*/}
            <div className={'filter-box'}>
                <select
                    value={selectedCategory}
                    onChange={e => {
                        setSelectedCategory(e.target.value);
                        handleSearch();
                    }}>
                    <option value={''}>카테고리 선택</option>
                    {category.map(cat => (
                        <option
                            key={cat.categoryCode}
                            value={cat.categoryCode}>
                            {cat.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            {/*검색창*/}
            <div className={'search-box'}>
                <input
                    type={'text'}
                    placeholder={'샵 이름 또는 위치 검색'}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>검색</button>
            </div>

            {/* 샵 목록 */}
            <div className={'shop-list'}>
                {shops.map(shop => (
                    <div
                        className={'shop-item'}
                        key={shop.shopCode}
                        onClick={() => onShopSelect(shop.shopCode)}
                    >
                        {shop.adMessage && <p className={'adMessage'}>{shop.adMessage}</p>}
                        <h4>{shop.shopName}</h4>
                        <p>{shop.categoryName}</p>
                        <p>{shop.shopLocation}</p>
                        <p>{shop.shopPhone}</p>
                    </div>
                ))}

            {/* 무한 스크롤 방지 요소 */}
            <div ref={loadNextPage} className={'scroll-sentinel'}>
                {loading && <p>로딩 중...</p>}
                {!hasMore && shops.length > 0 && <p>모든 샵을 불러왔습니다</p>}
            </div>
            </div>
        </div>
    )
}