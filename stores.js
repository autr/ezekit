import { writable } from 'svelte/store';

export const scroll = writable( {} )
export const centroid = writable( {} )
export const burger = writable( false )
export const pkg = writable( {} )
export const roots = writable( {} )
export const info = writable( {} )
export const dateFormat = writable( 'DD-MM-YYYY' ) //'D MMM, YYYY, dd' )
export const autoplay = writable( false )
export const controls = writable( false )
export const audio = writable( false )
export const eze = writable( { api: '', project: '' } )