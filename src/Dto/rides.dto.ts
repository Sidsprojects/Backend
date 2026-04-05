import { IsIn, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";


export class CreateRide {

    @IsInt()
    @IsNotEmpty()
    userId: number;
    
    @IsString()
    @IsNotEmpty()
    pickupLocation: string;
    
    @IsString()
    @IsNotEmpty()
    destination: string;
    
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    price: number;
    
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    seatsAvailable: number;
} 

export class GetAllRides {}

export class GetRideById {

    @IsInt()
    @IsNotEmpty()
    rideId: number;
}

export class BookRide {

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    rideId: number;
}

export class CancelRide {
    
    @IsInt()
    @IsNotEmpty()
    rideId: number;

    @IsInt()
    @IsNotEmpty()
    userId: number;
}