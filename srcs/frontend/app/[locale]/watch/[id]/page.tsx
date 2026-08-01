import { use } from "react"



export default function WatchPageMoviePage({ params }: { params: Promise<{ id: string }> }) {
    
    const resolvedParams = use(params)
    const id = resolvedParams.id

    const IP = process.env.PUBLIC_API_URL || 'http://localhost:8081/api'
    
    return (
        <div>
            <video src={`${IP}/movies/watch/${id}`} ></video>
        </div>
    )
}