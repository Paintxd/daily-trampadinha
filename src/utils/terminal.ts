import figlet from 'figlet';
import kleur from 'kleur';

export const clearAndPrint = () => {
  require('clear')();

  console.log(
    kleur.bgBlack().red(
      figlet.textSync('Daily Trampadinha', {
        font: '3D-ASCII',
      }),
    ),
  );
};
