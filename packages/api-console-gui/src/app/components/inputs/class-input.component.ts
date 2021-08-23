import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ClassSchema, PropertySchema } from '@deepkit/type';
import { trackByIndex } from '../../utils';
import { DataStructure } from '../../store';


@Component({
    template: `
        <ng-container *ngIf="!schema">
            No schema {{property.type}}
        </ng-container>

        <div class="box children" *ngIf="schema">
            <dui-select textured style="width: 100%" [(ngModel)]="model.asReference" *ngIf="property.isReference || property.backReference">
                <dui-option [value]="false">Create new {{schema.getClassName()}}</dui-option>
                <dui-option [value]="true">Reference existing</dui-option>
            </dui-select>

            <ng-container *ngFor="let p of schema.getProperties(); let last = last; trackBy: trackByIndex">
                <api-console-input *ngIf="!showOnlyPrimaryKey || p.isId"
                                   [decoration]="true" [class.last]="last"
                                   [model]="model.getProperty(p.name)" [property]="p"
                                   (modelChange)="modelChange.emit(model)"></api-console-input>
            </ng-container>
        </div>
    `,
    styles: [`
        .children {
            position: relative;
            border: 1px solid var(--line-color-light);
            border-radius: 3px;
            background-color: var(--dui-window-header-bg);
            margin-left: 20px;
        }
    `]
})
export class ClassInputComponent implements OnChanges, OnInit {
    trackByIndex = trackByIndex;
    @Input() model!: DataStructure;
    @Output() modelChange = new EventEmitter();

    schema?: ClassSchema;

    @Input() property!: PropertySchema;

    ngOnInit(): void {
        this.init();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.init();
    }

    get showOnlyPrimaryKey(): boolean {
        return (this.property.isReference || Boolean(this.property.backReference)) && this.model.asReference;
    }

    init() {
        this.schema = undefined;

        if (this.property.type === 'class' || this.property.type === 'partial') {
            this.schema = this.property.getResolvedClassSchema();
        }
    }
}