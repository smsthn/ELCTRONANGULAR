import { trigger, transition, style, query, animateChild, group, animate, stagger } from "@angular/animations";

export const slideInAnimation =
trigger('routeAnimations', [
    transition('MonthPage => DayPage', [
      // Set a default  style for enter and leave
      query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ]),
    query(':enter', [
      style({opacity:0.5, top: '-200%'})
    ]),
    group([
      query(':leave', [
        animate('300ms ease', style({opacity:0, top: '100%'}))
      ]),
      query(':enter', [
        animate('300ms ease', style({opacity:0.7, top: '0%'}))
      ])
    ]),
    ]),
  transition('DayPage => MonthPage', [
      // Set a default  style for enter and leave
      query(':enter, :leave', [
        style({
          position: 'fixed',
          top: 0,
        left: 0,
          width: '100%',
          opacity:0.5
      })
    ]),
    query(':enter', [
      style({position: 'fixed',opacity:0.5, top: '100vh'})
    ]),
    group([
      query(':leave', [
        animate('200ms ease', style({opacity:0, top: '-100vh'}))
      ]),
      query(':enter', [
        stagger(100, [
        animate('500ms ease', style({opacity:1, top: 0}))])
      ])
    ]),
    ]),
]);

export const slider =
  trigger('sliderAnimation', [
    transition('* => futur', slideTo('left') ),
    transition('* => past', slideTo('right') ),
    transition('past => *', slideTo('left') ),
    transition('futur => *', slideTo('right') )
  ]);

function slideTo(direction) {
  const optional = { optional: false };
  return [
    query(':enter, :leave', [
      style({
        position: 'fixed',
        top: 0,
        [direction]: 0,
        width: '100%'
      })
    ], optional),
    query(':enter', [
      style({ [direction]: '-100%'})
    ]),
    group([
      query(':leave', [
        animate('600ms ease', style({ [direction]: '100%'}))
      ], optional),
      query(':enter', [
        animate('600ms ease', style({ [direction]: '0%'}))
      ])
    ]),
    // Normalize the page style... Might not be necessary

    // Required only if you have child animations on the page
    // query(':leave', animateChild()),
    // query(':enter', animateChild()),
  ];
}

  // trigger('routeAnimations', [
  //   transition('MonthPage <=> DayPage', [
  //     style({ position: 'relative' }),
  //     query(':enter, :leave', [
  //       style({
  //         position: 'absolute',
  //         top: 0,
  //         left: 0,
  //         //width: '100%'
  //         height:'100%'
  //       })
  //     ]),
  //     query(':enter', [
  //       style({ height: '0'})
  //     ]),
  //     query(':leave', animateChild()),
  //     group([
  //       query(':leave', [
  //         animate('1s ease-out', style({ height: '100%'}))
  //       ]),
  //       query(':enter', [
  //         animate('1s ease-out', style({ height: '0%'}))
  //       ])
  //     ]),
  //     query(':enter', animateChild()),
  //   ]),
  //   transition('* <=> FilterPage', [
  //     style({ position: 'relative' }),
  //     query(':enter, :leave', [
  //       style({
  //         position: 'absolute',
  //         top: 0,
  //         left: 0,
  //         //width: '100%'
  //         height:'100%'
  //       })
  //     ]),
  //     query(':enter', [
  //       style({ height: '0'})
  //     ]),
  //     query(':leave', animateChild()),
  //     group([
  //       query(':leave', [
  //         animate('1s ease-out', style({ height: '100%'}))
  //       ]),
  //       query(':enter', [
  //         animate('1s ease-out', style({ height: '0'}))
  //       ])
  //     ]),
  //     query(':enter', animateChild()),
  //   ])
  // ]);
