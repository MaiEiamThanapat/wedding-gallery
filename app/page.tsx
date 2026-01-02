'use client';
import { useState, useEffect } from 'react';

// Define Interface for Message
interface Message {
    'ชื่อ-นามสกุล': string;
    'ข้อความอวยพร': string;
    'Timestamp': string;
    'รูปภาพ': string | null;
}

interface ApiResponse {
    data: Message[];
}

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{ [key: number]: { width: number; height: number; orientation: 'portrait' | 'landscape' | 'square' } }>({});
    const [displayIndex, setDisplayIndex] = useState<number>(0);

    const GOOGLE_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';
    // กำหนดเวลาในการดึงข้อมูลใหม่ (หน่วย: มิลลิวินาที)
    // 10000 = 10 วินาที, 30000 = 30 วินาที
    const REFRESH_INTERVAL = 2000;

    // กำหนดเวลาในการหมุนเปลี่ยนชุดข้อมูล (หน่วย: มิลลิวินาที)
    const ROTATION_INTERVAL = 2000;
    const ITEMS_PER_PAGE = 10;


    const fetchData = async () => {
        if (GOOGLE_SCRIPT_URL === 'YOUR_WEB_APP_URL_HERE') {
            console.log('Using Mock Data');
            setMessages([
                {
                    'ชื่อ-นามสกุล': '1',
                    'ข้อความอวยพร': 'ขอให้มีความสุขมากๆ นะครับ',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/IMG_2385.jpg'
                },
                {
                    'ชื่อ-นามสกุล': '2',
                    'ข้อความอวยพร': 'Congratulations! ดีใจด้วยนะคะ',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/IMG_2385.jpg'
                },
                {
                    'ชื่อ-นามสกุล': '3',
                    'ข้อความอวยพร': 'ยินดีด้วยนะเพื่อน รักกันนานๆ นะ',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/IMG_2385.jpg'
                },
                {
                    'ชื่อ-นามสกุล': '4',
                    'ข้อความอวยพร': 'ขอให้รักกันตลอดไป',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/IMG_2334.jpg'
                },
                {
                    'ชื่อ-นามสกุล': 'สุดหล่อ',
                    'ข้อความอวยพร': 'ขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไปขอให้รักกันตลอดไป',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': ''
                },
                {
                    'ชื่อ-นามสกุล': '6',
                    'ข้อความอวยพร': 'ขอให้รักกันตลอดไป',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/IMG_2334.jpg'
                },
                {
                    'ชื่อ-นามสกุล': '7',
                    'ข้อความอวยพร': 'พี่สาวแต่งงาน ดีใจมากๆ เลย',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/IMG_2385.jpg'
                },
                {
                    'ชื่อ-นามสกุล': '8',
                    'ข้อความอวยพร': 'Beautiful couple! 💕',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/IMG_2385.jpg'
                },
                {
                    'ชื่อ-นามสกุล': '9',
                    'ข้อความอวยพร': 'Beautiful couple! 💕',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/iso.png'
                },
                {
                    'ชื่อ-นามสกุล': '10',
                    'ข้อความอวยพร': 'Beautiful couple! 💕',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/engine.png'
                }, {
                    'ชื่อ-นามสกุล': '11',
                    'ข้อความอวยพร': 'Beautiful couple! 💕',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/IMG_2339.jpg'
                }, {
                    'ชื่อ-นามสกุล': '12',
                    'ข้อความอวยพร': 'Beautiful couple! 💕',
                    'Timestamp': new Date().toISOString(),
                    'รูปภาพ': '/IMG_2339.jpg'
                }
            ]);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            if (!response.ok) throw new Error('Network error');
            const result: ApiResponse = await response.json();
            setMessages(result.data);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    // Track viewport height
    useEffect(() => {
        const updateViewportHeight = () => {
            // setViewportHeight(window.innerHeight);
        };

        updateViewportHeight();
        window.addEventListener('resize', updateViewportHeight);
        return () => window.removeEventListener('resize', updateViewportHeight);
    }, []);

    // Load image dimensions and detect orientation
    useEffect(() => {
        if (messages.length === 0) return;

        messages.forEach((msg, index) => {
            if (msg['รูปภาพ'] && msg['รูปภาพ'] !== '') {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    let orientation: 'portrait' | 'landscape' | 'square';

                    if (aspectRatio > 1.1) {
                        orientation = 'landscape';
                    } else if (aspectRatio < 0.9) {
                        orientation = 'portrait';
                    } else {
                        orientation = 'square';
                    }

                    setImageDimensions(prev => ({
                        ...prev,
                        [index]: {
                            width: img.width,
                            height: img.height,
                            orientation
                        }
                    }));
                };
                img.src = msg['รูปภาพ'];
            } else {
                // No image - mark as square placeholder
                setImageDimensions(prev => ({
                    ...prev,
                    [index]: {
                        width: 300,
                        height: 300,
                        orientation: 'square'
                    }
                }));
            }
        });
    }, [messages]);

    // Auto-rotate displayed items
    useEffect(() => {
        if (messages.length <= ITEMS_PER_PAGE) return;

        const interval = setInterval(() => {
            setDisplayIndex((prev) => (prev + 1) % messages.length);
        }, ROTATION_INTERVAL);

        return () => clearInterval(interval);
    }, [messages.length, ROTATION_INTERVAL]);

    // Calculate max visible items based on viewport and image sizes
    useEffect(() => {
        return; // Disabled
        if (false || messages.length === 0) return;

        // Header height approximately 200px, add padding
        const availableHeight = 0; // viewportHeight - 280;

        // Base polaroid card dimensions
        const cardPadding = 64; // p-4 + pb-12 + margin
        const portraitHeight = 400; // Approximate for portrait
        const landscapeHeight = 300; // Approximate for landscape
        const squareHeight = 320; // Approximate for square

        // Count cards by orientation
        let totalEstimatedHeight = 0;
        let itemCount = 0;

        // Estimate columns based on screen width
        const screenWidth = window.innerWidth;
        let columns = 2; // mobile default
        if (screenWidth >= 1024) columns = 4; // lg
        else if (screenWidth >= 768) columns = 3; // md

        // Calculate how many rows can fit
        const avgCardHeight = (portraitHeight + landscapeHeight + squareHeight) / 3 + cardPadding;
        const estimatedRowsNeeded = Math.ceil(messages.length / columns);
        const totalNeededHeight = estimatedRowsNeeded * avgCardHeight;

        if (totalNeededHeight <= availableHeight) {
            // All items fit
            // setMaxVisibleItems(messages.length);
        } else {
            // Calculate how many rows can fit
            const maxRows = Math.floor(availableHeight / avgCardHeight);
            const maxItems = Math.max(columns, maxRows * columns);
            // setMaxVisibleItems(Math.min(maxItems, messages.length));
        }
    }, []);

    return (
        <div className="h-screen relative overflow-hidden flex flex-col"
            style={{
                background: 'linear-gradient(135deg, #f5e6d3 0%, #d4b896 100%)',
            }}>

            {/* Header */}
            <header className="text-center py-4 relative z-10 flex-none bg-white/30 backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl text-amber-700">🌿</span>
                    <h1 className="text-3xl md:text-5xl text-amber-900"
                        style={{ fontFamily: "'Dancing Script', cursive" }}>
                        Khun & Jan's Wedding Gallery
                    </h1>
                    <span className="text-3xl text-amber-700">🌿</span>
                </div>
            </header>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-700 mx-auto"></div>
                    <p className="mt-4 text-amber-800" style={{ fontFamily: "'Dancing Script', cursive" }}>
                        Loading memories...
                    </p>
                </div>
            ) : (

                <div className="flex-1 overflow-hidden p-6 w-full h-full relative">
                    <div className="w-full h-full">
                        {/* Polaroid Collage Grid - Masonry Style */}
                        {/* GRID CONFIGURATION: ปรับขนาดรูปตรงนี้ - ลดจำนวน columns ลงจะทำให้รูปใหญ่ขึ้น (เช่น columns-2 คือ 2 แถวตอนรูปจะใหญ่สุด) */}
                        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6 h-full pb-20">
                            {Array.from({ length: Math.min(ITEMS_PER_PAGE, messages.length) }).map((_, i) => {
                                const index = (displayIndex + i) % messages.length;
                                const msg = messages[index];
                                if (!msg) return null;

                                // Random rotation for polaroid effect
                                const rotation = [
                                    'rotate-[-2deg]',
                                    'rotate-[1deg]',
                                    'rotate-[-1deg]',
                                    'rotate-[2deg]',
                                    'rotate-[-3deg]',
                                    'rotate-[3deg]'
                                ][index % 6];

                                // Get image orientation
                                const imgData = imageDimensions[index];
                                const orientation = imgData?.orientation || 'square';

                                // Determine image container height based on orientation
                                let imageHeightClass = 'aspect-square'; // default/square
                                if (orientation === 'portrait') {
                                    imageHeightClass = 'aspect-[3/4]'; // Portrait
                                } else if (orientation === 'landscape') {
                                    imageHeightClass = 'aspect-[4/3]'; // Landscape
                                }

                                return (
                                    <div
                                        key={index}
                                        className={`polaroid-card ${rotation} hover:scale-105 hover:rotate-0 hover:z-20 transition-all duration-500 ease-out cursor-pointer inline-block w-full break-inside-avoid p-2`}
                                        onClick={() => msg['รูปภาพ'] && msg['รูปภาพ'] !== '' && setSelectedImage(msg['รูปภาพ'])}
                                        style={{
                                            animationDelay: `${index * 0.1}s`
                                        }}
                                    >
                                        {/* Polaroid Frame */}
                                        <div className="bg-white p-3 pb-8 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-sm">
                                            {/* Photo */}
                                            {msg['รูปภาพ'] && msg['รูปภาพ'] !== '' && (
                                                <div className="bg-gray-100 mb-3 overflow-hidden">
                                                    <div className={`${imageHeightClass} w-full`}>
                                                        <img
                                                            src={msg['รูปภาพ']}
                                                            alt={msg['ชื่อ-นามสกุล']}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Caption */}
                                            <div className="text-center px-1">
                                                <p className="text-lg font-semibold text-gray-800 mb-1 leading-tight"
                                                    style={{ fontFamily: "'Kanit', sans-serif" }}>
                                                    {msg['ข้อความอวยพร']}
                                                </p>
                                                <p className="text-sm text-gray-500 italic truncate"
                                                    style={{ fontFamily: "'Kanit', sans-serif" }}>
                                                    {msg['ชื่อ-นามสกุล']}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div >
            )
            }

            {/* Modal */}
            {
                selectedImage && (
                    <div
                        className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white text-5xl font-light z-50 leading-none"
                            >
                                &times;
                            </button>
                            <img
                                src={selectedImage}
                                alt="Full size"
                                className="max-w-full max-h-full object-contain rounded shadow-2xl"
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}
