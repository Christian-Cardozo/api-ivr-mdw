import { RedisModule } from "@app/redis";
import { Module } from "@nestjs/common";
import { CircuitBreakerStore } from "./circuit-breaker.store";
import { CircuitBreakerService } from "./circuit-breaker.service";

@Module({
    imports: [RedisModule],
    providers: [CircuitBreakerService, CircuitBreakerStore],
    exports: [CircuitBreakerService]
})
export class CircuitBreakerModule{}