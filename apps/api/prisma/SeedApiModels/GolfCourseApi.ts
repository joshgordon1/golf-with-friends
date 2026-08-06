type ApiHole = {
    par: number;
    yardage: number;
    handicap: number
}
type ApiTee = {
  tee_name: string
  course_rating: number
  slope_rating: number
  total_yards: number
  total_meters: number
  par_total: number
  holes: ApiHole[]
}
type ApiCourse = {
  course: {
    id: string
    club_name: string
    course_name: string
    location: { address: string; city: string; state: string; country: string }
    tees: { male: ApiTee[]; female: ApiTee[] }
  }
}