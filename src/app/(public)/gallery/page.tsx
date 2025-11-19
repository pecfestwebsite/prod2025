'use client';
import { useState } from "react";
import { ThreeDImageRing } from "@/components/3d-image-ring";
import DomeGallery from "@/components/DomeGallery";
import { ChevronDown, Camera, Film } from "lucide-react"; 
import { getGDriveImageUrl } from "@/lib/utils";

export default function GalleryPage() {
    // Google Drive File IDs for gallery images
    const gdriveFileIds = [
        "1L6qia54XT8ny0sjbRBjO-bWvaKdxUDdy",
        "1-WucFQKhRNN7XKrxca-ANblFlh-uXy0z",
        "1F_MmfJs1z-R9DrNTodMNbZ_uQL6XBitE",
        "1nY2BTeEb6t1-Lof5Z725V-ElkPFVfTgB",
        "1v4Xh5cpshG5eqVU3XKWSHJHtSAHIegmD",
        "18iOdq_tHGHkK1DreX27CalfaGV9TI5l4",
        "13oA-Y_RmNort_IFzTbim32WEYRb5mBVE",
        "1xBytfKA-noxjiFv6TvU1YPcaLIHY534h",
        "1MeLxBLb0by_V3700tkEg2iM8vGKoThMQ",
        "1Py2RA7eoXpeWXq478U4iwyIA_ptIf0sy",
        "1pRpF6AFCeLL0Qjl5YmUQbm1uxkTV1gBA",
        "1l4qWB99WWCSkRjxUAfWEc0tIhEKTtjOR",
        "1FdkXOQW2uGQLmEVVXZ8EeP3dSiCuzllu",
        "1DWK-17lokEDdJLZOUTneQOyJCbODJ9zl",
        "1bOlPPxOF1urWZLxWg2oHOfIgghEwV1bs",
        "1dUCKH_Sw9al_D7HefH0GSdz-SAOwFdSP",
        "1muuYni1DbEUjD7N5Sw49lQHG2T5K1tM-",
        "1FraQ4c0pFPsT7BFmJdeSnkxTJSbRpZxr",
        "1h3YIb26zJQh-ZcC2tjJr355XUj29zHgP",
        "1cpvJyuDfu9PBSj7PM3Nnr64zXq19h0dF",
        "1WfzbBgUpq2THhR7eT9YA-8r1iKXibIOL",
    ];
    
    // Generate image URLs from Google Drive file IDs
    const imageUrls = gdriveFileIds.map(fileId => getGDriveImageUrl(fileId));

    return (
        <main className="relative w-full min-h-screen overflow-x-hidden bg-[#0a0a0a]">
            
            {/* 📸 Dome Gallery Section - Full Screen (The initial view) */}
            <section className="relative w-full h-screen bg-gradient-to-b from-[#1a0a2e] to-[#0a0a0a]">
                
                {/* Retro Film Grain Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

                {/* Dome Gallery Component */}
                <div className="absolute inset-0">
                    <DomeGallery 
                        images={imageUrls}
                        grayscale={false}
                    />
                </div>

                {/* Scroll Indicator */}
                <div 
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/60 pointer-events-none"
                >
                    <span className="text-sm font-mono tracking-wider">EXPLORE MORE</span>
                    <ChevronDown className="w-6 h-6 animate-bounce" /> 
                </div>
            </section>

            {/* 📖 Retro Story Section (Scrollable content below the dome) */}
            <section className="relative min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a0a2e] py-20 px-8">
                
                {/* Retro Divider */}
                <div className="max-w-6xl mx-auto mb-16">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#b53da1] to-transparent mb-8" />
                    <h3 className="text-center text-3xl md:text-5xl font-serif text-[#ffd4b9] mb-4">
                        A Journey Through Time
                    </h3>
                    <div className="h-px bg-gradient-to-r from-transparent via-[#b53da1] to-transparent mt-8" />
                </div>

                {/* Story Text Blocks - Retro Style */}
                <div className="max-w-4xl mx-auto space-y-16 mb-20">
                    <div className="border-l-4 border-[#b53da1] pl-8">
                        <p className="text-white/80 text-xl leading-relaxed font-light">
                            In the golden hours of PecFest, when the stage lights illuminated countless faces 
                            filled with wonder, we captured more than photographs. We captured the essence of youth, 
                            the spirit of celebration, and the magic that happens when thousands of hearts beat as one.
                        </p>
                    </div>

                    <div className="border-l-4 border-[#ed6ab8] pl-8">
                        <p className="text-white/80 text-xl leading-relaxed font-light">
                            These memories are like vinyl records—they age with grace, becoming more precious with time. 
                            Each image is a frame from a movie that played only once, starring you and thousands of others 
                            who dared to make memories instead of watching from the sidelines.
                        </p>
                    </div>

                    <div className="border-l-4 border-[#fea6cc] pl-8">
                        <p className="text-white/80 text-xl leading-relaxed font-light">
                            So take your time. Drag through the dome, spin the ring, and rediscover moments you might have 
                            forgotten. Because in this fast-moving world, these frozen moments are your time machine—
                            your way back to the nights that felt endless and the laughter that echoed through the grounds.
                        </p>
                    </div>
                </div>

                {/* 🔄 3D Ring Section - TIGHT SPACING APPLIED */}
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h4 className="text-4xl font-serif text-[#ed6ab8] mb-4">
                            The Memory Carousel
                        </h4>
                        <p className="text-white/60 text-lg font-light">
                            Spin through time • Drag to explore • Click to enlarge
                        </p>
                    </div>
                    
                    <div className="relative w-full h-[500px] flex items-center justify-center border-4 border-[#b53da1]/20 rounded-lg bg-gradient-to-br from-[#1a0a2e]/50 to-[#0a0a0a]/50 backdrop-blur-sm">
                        {/* Instructional Text inside the box */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-mono z-10 text-center">
                            Drag to spin the memories <br/> (or scroll for a gentle glide!)
                        </div>
                        <ThreeDImageRing 
                            images={imageUrls}
                            perspective={2000}
                            imageDistance={600} // Set back to 600 for tight spacing
                        />
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="max-w-4xl mx-auto mt-20 text-center">
                    <blockquote className="text-2xl md:text-3xl font-serif italic text-[#ffd4b9]/80 leading-relaxed">
                        "We don't remember days, we remember moments."
                    </blockquote>
                    <p className="text-white/40 mt-4 font-mono text-sm">— Cesare Pavese</p>
                </div>
            </section>

            {/* Retro Corner Frame Effects - Fixed on screen */}
            <div className="fixed top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#b53da1]/30 pointer-events-none z-50" />
            <div className="fixed top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-[#b53da1]/30 pointer-events-none z-50" />
            <div className="fixed bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-[#b53da1]/30 pointer-events-none z-50" />
            <div className="fixed bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#b53da1]/30 pointer-events-none z-50" />
        </main>
    );
}