"use client"

import VideoSection from "@/app/components/layout/videoSection"
import { useMovieDetails } from "@/lib/dataHooks/moviesDetails"
import { use } from "react"



export default function WatchPageMoviePage({ params }: { params: Promise<{ id: string }> }) {
    
    const resolvedParams = use(params)
    const id = resolvedParams.id
    const { data, isPending, error } = useMovieDetails(id)
    if (isPending)
        return (
            <div>Loading...</div>
        )
    if (error) return (
            <div>Error..</div>
        )
    
    return (
        <div>
            <VideoSection id={id} title={data.data.movie.title} description={data.data.movie.description} thumbnail={data.data.movie.poster} />
        </div>
    )
}